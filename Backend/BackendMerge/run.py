from flask import Flask
from extensions import mongo, jwt
from Signup.app.routes import signup_routes
from ML.facial_landmark_detection.ffr.routes import ffr_bp

def create_unified_app():
    app = Flask(__name__)
    app.config.from_object('Backend configuration.')

    app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
    import datetime
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours = 5)

    mongo.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(signup_routes, url_prefix='/auth')
    app.register_blueprint(ffr_bp, url_prefix='/ffr')

    return app

if __name__ == '__main__':
    app = create_unified_app()
    app.run(debug = True)