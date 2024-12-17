import urllib.parse

# MongoDB credentials and URI setup
username = "VinukiR"
password = "rrJ6Q%.k4EqJLG9"
encoded_username = urllib.parse.quote_plus(username)
encoded_password = urllib.parse.quote_plus(password)

MONGO_URI = f'mongodb+srv://{encoded_username}:{encoded_password}@cluster1.1nrjp.mongodb.net/mydatabase?retryWrites=true&w=majority'
