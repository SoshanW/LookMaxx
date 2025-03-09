from flask_mail import Message
from flask import jsonify
from app.config import mail

def send_mail(user, receive_mail, msg_text):
    try: 
        subject = f"New Form Submission from {user.get('first_name')} {user.get('last_name')}"
        body = f"""
        Hello,

        A new form submission has been received.

        **User Details:**
        - First Name: {user.get('first_name')}
        - Last Name: {user.get('last_name')}
        - Email: {user.get('email')}
        - FFR Results: {user.get('ffr_results')}

        **Form Submission:**
        - Message: {msg_text}

        Regards,
        Look-Sci
        """

        msg = Message(subject, recipients=[receive_mail], body=body)
        mail.send(msg)

        return {"message": "Email has been sent successfully! We wish you the best of luck!"}, 200
    
    except Exception as e:
        return {"Error": f"Failed to send email: {str(e)}"}, 500