# run.py
from flask import Flask
from flask_cors import CORS
from routes.climate_routes import climate_blueprint # Import the new blueprint

# Create the main Flask app instance
app = Flask(__name__)
CORS(app)

# Register the blueprint with a base URL prefix for all its routes
app.register_blueprint(climate_blueprint, url_prefix='/api')

@app.route('/')
def index():
    return "Climate Resilience API server is running!"

if __name__ == '__main__':
    app.run(debug=True)
