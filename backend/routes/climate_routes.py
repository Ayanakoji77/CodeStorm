# routes/climate_routes.py
from flask import Blueprint, jsonify, request
from services import climate_service # Import your new service file

climate_blueprint = Blueprint('climate_api', __name__)

# --- PREPARE ROUTES ---
@climate_blueprint.route('/prepare/instructions', methods=['GET'])
def handle_get_instructions():
    instructions, error = climate_service.get_all_instructions()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(instructions)

@climate_blueprint.route('/prepare/kit', methods=['GET'])
def handle_get_kit():
    kit_items, error = climate_service.get_all_kit_items()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(kit_items)

# --- RESPOND ROUTES ---
@climate_blueprint.route('/respond/shelters', methods=['GET'])
def handle_get_shelters():
    shelters, error = climate_service.get_all_shelters()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(shelters)

# --- RECOVER ROUTES ---
@climate_blueprint.route('/recover/request-aid', methods=['POST'])
def handle_add_aid_request():
    data = request.get_json()
    if not data or 'name' not in data or 'location' not in data or 'aid_needed' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    new_request, error = climate_service.add_aid_request(data['name'], data['location'], data['aid_needed'])
    if error:
        return jsonify({"error": error}), 500
        
    return jsonify(new_request), 201
