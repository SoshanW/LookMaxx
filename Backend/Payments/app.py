# app.py
from flask import request, jsonify
from flask_cors import CORS
import hashlib
import logging
import time
import requests
import json
from bson.objectid import ObjectId
from config import app, mongo
from config import MERCHANT_ID, MERCHANT_SECRET, API_KEY, SANDBOX_URL, SANDBOX_API_URL, RETURN_URL, CANCEL_URL, NOTIFY_URL

# Configure logging
logging.basicConfig(level=logging.INFO)

# Enable CORS for React frontend
CORS(app)


# Premium package details (update these as needed)
PREMIUM_AMOUNT = 15
PREMIUM_CURRENCY = "USD"
PREMIUM_DESCRIPTION = "Premium Membership Upgrade"

@app.route('/api/create-payment', methods=['POST'])
def create_payment():
    """
    Create a one-time payment for premium upgrade
    """
    try:
        # Get user ID from request
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400
        
        # Get user info from MongoDB
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Generate order ID
        order_id = f"PREMIUM_{user_id}_{int(time.time())}"
        
        # Create payment record
        payment_record = {
            'user_id': ObjectId(user_id),
            'order_id': order_id,
            'amount': PREMIUM_AMOUNT,
            'currency': PREMIUM_CURRENCY,
            'status': 'pending',
            'payment_type': 'one_time',
            'created_at': time.time()
        }
        
        # Update user document with payment record
        update_payment = mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$push': {
                    'payment_records': payment_record
                }
            }
        )
        
        if not update_payment.modified_count:
            return jsonify({'error': 'Failed to save Payment record to database'}), 500
        
        # Create hash for PayHere
        hash_value = generate_hash(order_id, PREMIUM_AMOUNT, PREMIUM_CURRENCY)
        
        # Create checkout data for PayHere
        checkout_data = {
            'merchant_id': MERCHANT_ID,
            'return_url': RETURN_URL,
            'cancel_url': CANCEL_URL,
            'notify_url': NOTIFY_URL,
            'order_id': order_id,
            'items': PREMIUM_DESCRIPTION,
            'amount': PREMIUM_AMOUNT,
            'currency': PREMIUM_CURRENCY,
            'hash': hash_value
        }
        
        # Add user details if available
        if user.get('first_name'):
            checkout_data['first_name'] = user.get('first_name')
        if user.get('last_name'):
            checkout_data['last_name'] = user.get('last_name')
        if user.get('email'):
            checkout_data['email'] = user.get('email')
        if user.get('phone'):
            checkout_data['phone'] = user.get('phone')
        
        return jsonify({
            'success': True,
            'checkout_data': checkout_data,
            'checkout_url': SANDBOX_URL
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-subscription', methods=['POST'])
def create_subscription():
    """
    Create a recurring subscription for premium features (quarterly)
    """
    try:
        # Get user ID from request
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400
        
        # Get user details from MongoDB
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Generate subscription ID
        subscription_id = f"SUB_{user_id}_{int(time.time())}"
        
        # Set duration to 3 months for quarterly subscription
        duration = "3 Months"
        recurrence = "3 Months"
        
        # Create subscription record
        subscription_record = {
            'user_id': ObjectId(user_id),
            'subscription_id': subscription_id,
            'amount': PREMIUM_AMOUNT,
            'currency': PREMIUM_CURRENCY,
            'period': 'quarter',
            'status': 'pending',
            'created_at': time.time()
        }
        
        # Update user document with subscription record
        update_subscription_record = mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$push': {
                    'subscription_records': subscription_record
                }
            }
        )
        
        if not update_subscription_record.modified_count:
            return jsonify({'error': 'Failed to save Subscription Record to database'}), 500
        
        # Create hash for PayHere
        hash_value = generate_hash(subscription_id, PREMIUM_AMOUNT, PREMIUM_CURRENCY)
        
        # Create checkout data for PayHere subscription
        checkout_data = {
            'merchant_id': MERCHANT_ID,
            'return_url': RETURN_URL,
            'cancel_url': CANCEL_URL,
            'notify_url': NOTIFY_URL,
            'order_id': subscription_id,
            'items': "Premium Subscription (Quarterly)",
            'amount': PREMIUM_AMOUNT,
            'currency': PREMIUM_CURRENCY,
            'recurrence': recurrence,
            'duration': duration,
            'hash': hash_value
        }
        
        # Add user details if available
        if user.get('first_name'):
            checkout_data['first_name'] = user.get('first_name')
        if user.get('last_name'):
            checkout_data['last_name'] = user.get('last_name')
        if user.get('email'):
            checkout_data['email'] = user.get('email')
        if user.get('phone'):
            checkout_data['phone'] = user.get('phone')
        
        return jsonify({
            'success': True,
            'checkout_data': checkout_data,
            'checkout_url': SANDBOX_URL
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def update_premium_status(user_id, is_subscription=False, period='month'):
    """
    Update user's premium status after successful payment
    """
    # Calculate premium expiry based on subscription type
    premium_expiry = None
    if is_subscription:
        if period == 'quarter':
            # Add 90 days for quarterly subscription
            premium_expiry = time.time() + (90 * 24 * 60 * 60)
        elif period == 'month':
            # Add 30 days
            premium_expiry = time.time() + (30 * 24 * 60 * 60)
        else:
            # Add 365 days for annual
            premium_expiry = time.time() + (365 * 24 * 60 * 60)
    else:
        # For one-time payments, set expiry to 90 days (3 months)
        premium_expiry = time.time() + (90 * 24 * 60 * 60)
    
    update_data = {
        'is_premium': True,
        'premium_since': time.time(),
        'premium_expiry': premium_expiry
    }
    
    # Update user's premium status
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': update_data}
    )

@app.route('/api/payment/notify', methods=['POST'])
def payment_notification():
    """
    Handle PayHere payment notifications (webhook)
    """
    # PayHere sends data as form data, not JSON
    data = request.form.to_dict()
    
    # Log the notification data for debugging
    app.logger.info(f"Payment notification received: {data}")
    
    # Verify the notification is legitimate
    if verify_payment_notification(data):
        try:
            # Extract payment details
            merchant_id = data.get('merchant_id')
            order_id = data.get('order_id')
            payment_id = data.get('payment_id')
            payhere_amount = data.get('payhere_amount')
            payhere_currency = data.get('payhere_currency')
            status_code = data.get('status_code')
            status_message = data.get('status_message')
            method = data.get('method', 'N/A')  # Payment method used
            
            # Extract card details if available
            card_holder_name = data.get('card_holder_name', 'N/A')
            card_no = data.get('card_no', 'N/A')
            card_expiry = data.get('card_expiry', 'N/A')
            
            # Get custom parameters if set
            custom_1 = data.get('custom_1', '')
            custom_2 = data.get('custom_2', '')
            
            # Check if this is a subscription or one-time payment
            is_subscription = order_id.startswith('SUB_')
            
            # Find the user with this payment/subscription record
            if is_subscription:
                user_data = mongo.db.users.find_one({"subscription_records.subscription_id": order_id})
                if not user_data:
                    app.logger.error(f"Subscription record not found for order_id: {order_id}")
                    return "Subscription record not found", 404
                
                # Find the specific subscription record
                subscription_record = None
                for record in user_data.get('subscription_records', []):
                    if record.get('subscription_id') == order_id:
                        subscription_record = record
                        break
                
                if not subscription_record:
                    app.logger.error(f"Subscription record details not found for order_id: {order_id}")
                    return "Subscription record details not found", 404
                
                user_id = user_data['_id']
                period = subscription_record.get('period', 'month')
            else:
                user_data = mongo.db.users.find_one({"payment_records.order_id": order_id})
                if not user_data:
                    app.logger.error(f"Payment record not found for order_id: {order_id}")
                    return "Payment record not found", 404
                
                user_id = user_data['_id']
                period = 'month'  # Default for one-time payments
            
            # Process based on status code
            # 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Charged Back
            payment_status = determine_payment_status(status_code)
            
            # Prepare payment details to store
            payment_details = {
                'payment_id': payment_id,
                'status': payment_status,
                'status_code': status_code,
                'status_message': status_message,
                'payment_method': method,
                'payhere_amount': payhere_amount,
                'payhere_currency': payhere_currency,
                'updated_at': time.time()
            }
            
            # Add card details if available
            if card_no != 'N/A':
                payment_details.update({
                    'card_holder_name': card_holder_name,
                    'card_no': card_no,
                    'card_expiry': card_expiry
                })
            
            # Only update premium status if payment is successful
            if status_code == '2':
                update_premium_status(user_id, is_subscription, period=period)
            
            # Update payment record in the user document
            if is_subscription:
                mongo.db.users.update_one(
                    {
                        "_id": ObjectId(user_id),
                        "subscription_records.subscription_id": order_id
                    },
                    {
                        "$set": {
                            "subscription_records.$": {
                                **subscription_record,
                                **payment_details
                            }
                        }
                    }
                )
            else:
                # Find the payment record
                payment_record = None
                for record in user_data.get('payment_records', []):
                    if record.get('order_id') == order_id:
                        payment_record = record
                        break
                
                if payment_record:
                    mongo.db.users.update_one(
                        {
                            "_id": ObjectId(user_id),
                            "payment_records.order_id": order_id
                        },
                        {
                            "$set": {
                                "payment_records.$": {
                                    **payment_record,
                                    **payment_details
                                }
                            }
                        }
                    )
            
            app.logger.info(f"Payment notification processed successfully for order_id: {order_id}, status: {payment_status}")
            return "Payment notification processed", 200
        
        except Exception as e:
            app.logger.error(f"Error processing payment notification: {str(e)}")
            return f"Error processing notification: {str(e)}", 500
    else:
        app.logger.warning(f"Invalid notification signature received: {data.get('md5sig', 'No signature')}")
        return "Invalid notification signature", 400

@app.route('/api/verify-payment/<order_id>', methods=['GET'])
def verify_payment(order_id):
    """
    Verify payment status using PayHere API
    """
    try:
        # Determine if this is a subscription or one-time payment
        is_subscription = order_id.startswith('SUB_')
        
        # Set the correct API endpoint
        endpoint = f"{SANDBOX_API_URL}/payment/search?order_id={order_id}"
        
        # Create headers with API key
        headers = {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Send request to PayHere
        response = requests.get(endpoint, headers=headers)
        
        if response.status_code == 200:
            payment_data = response.json()
            
            # Find the user with this payment/subscription record
            if is_subscription:
                user_data = mongo.db.users.find_one({"subscription_records.subscription_id": order_id})
                if not user_data:
                    return jsonify({'success': False, 'error': 'Subscription record not found'}), 404
                
                user_id = user_data['_id']
                
                if payment_data.get('data') and len(payment_data['data']) > 0:
                    payment_status = determine_payment_status(payment_data['data'][0]['status_code'])
                    
                    mongo.db.users.update_one(
                        {
                            "_id": ObjectId(user_id),
                            "subscription_records.subscription_id": order_id
                        },
                        {
                            "$set": {
                                "subscription_records.$.status": payment_status,
                                "subscription_records.$.verified_at": time.time(),
                                "subscription_records.$.payment_data": payment_data
                            }
                        }
                    )
            else:
                user_data = mongo.db.users.find_one({"payment_records.order_id": order_id})
                if not user_data:
                    return jsonify({'success': False, 'error': 'Payment record not found'}), 404
                
                user_id = user_data['_id']
                
                if payment_data.get('data') and len(payment_data['data']) > 0:
                    payment_status = determine_payment_status(payment_data['data'][0]['status_code'])
                    
                    mongo.db.users.update_one(
                        {
                            "_id": ObjectId(user_id),
                            "payment_records.order_id": order_id
                        },
                        {
                            "$set": {
                                "payment_records.$.status": payment_status,
                                "payment_records.$.verified_at": time.time(),
                                "payment_records.$.payment_data": payment_data
                            }
                        }
                    )
            
            return jsonify({
                'success': True,
                'payment_data': payment_data
            })
        else:
            return jsonify({
                'success': False,
                'error': f"Failed to verify payment: {response.status_code}"
            }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def determine_payment_status(status_code):
    """Convert PayHere status code to readable status"""
    status_codes = {
        '2': 'completed',
        '0': 'pending',
        '-1': 'canceled',
        '-2': 'failed',
        '-3': 'chargedback'
    }
    return status_codes.get(str(status_code), 'unknown')

@app.route('/api/check-premium/<user_id>', methods=['GET'])
def check_premium(user_id):
    """
    Check if a user has premium status
    """
    try:
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        is_premium = user.get('is_premium', False)
        premium_since = user.get('premium_since')
        premium_expiry = user.get('premium_expiry')
        
        # Check if premium has expired
        if is_premium and premium_expiry and premium_expiry < time.time():
            is_premium = False
            # Update user record to reflect expired premium
            mongo.db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'is_premium': False}}
            )
        
        return jsonify({
            'success': True,
            'is_premium': is_premium,
            'premium_since': premium_since,
            'premium_expiry': premium_expiry
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_hash(order_id, amount, currency):
    """
    Generate the hash required by PayHere
    Format: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))
    """
    # Format amount with 2 decimal places
    formatted_amount = "{:.2f}".format(float(amount))
    
    # Generate MD5 of merchant secret first
    hashed_secret = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()
    
    # Now generate the full hash
    hash_string = f"{MERCHANT_ID}{order_id}{formatted_amount}{currency}{hashed_secret}"
    return hashlib.md5(hash_string.encode()).hexdigest().upper()

def verify_payment_notification(data):
    """
    Verify that the notification is legitimate and comes from PayHere
    md5sig = MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))
    """
    received_hash = data.get('md5sig')
    
    if not received_hash:
        return False
    
    merchant_id = data.get('merchant_id')
    order_id = data.get('order_id')
    payhere_amount = data.get('payhere_amount')
    payhere_currency = data.get('payhere_currency')
    status_code = data.get('status_code')
    
    # Check if all required parameters exist
    if not all([merchant_id, order_id, payhere_amount, payhere_currency, status_code]):
        return False
    
    # Generate MD5 of merchant secret first
    hashed_secret = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()
    
    # Generate the verification hash
    verification_string = f"{merchant_id}{order_id}{payhere_amount}{payhere_currency}{status_code}{hashed_secret}"
    calculated_hash = hashlib.md5(verification_string.encode()).hexdigest().upper()
    
    # Compare the calculated hash with the received hash
    return calculated_hash == received_hash

if __name__ == '__main__':
    app.run(debug=True, port=5000)