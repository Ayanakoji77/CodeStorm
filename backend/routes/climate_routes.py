# routes/climate_routes.py - Enhanced with better error handling
from flask import Blueprint, jsonify, request
from services import climate_service

climate_blueprint = Blueprint('climate_api', __name__)

# --- PREPARE ROUTES ---
@climate_blueprint.route('/prepare/instructions', methods=['GET'])
def handle_get_instructions():
    """Get all disaster preparedness instructions"""
    try:
        instructions, error = climate_service.get_all_instructions()
        if error:
            return jsonify({"error": error}), 500
        return jsonify(instructions), 200
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@climate_blueprint.route('/prepare/kit', methods=['GET'])
def handle_get_kit():
    """Get all emergency kit items"""
    try:
        kit_items, error = climate_service.get_all_kit_items()
        if error:
            return jsonify({"error": error}), 500
        return jsonify(kit_items), 200
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@climate_blueprint.route('/prepare/news', methods=['GET'])
def handle_get_news():
    """Get climate-related news for a specific location"""
    try:
        user_location = request.args.get('location', default="India", type=str)
        category = request.args.get('category', default="disaster", type=str)

        # Validate inputs
        if not user_location.strip():
            return jsonify({"error": "Location parameter is required"}), 400

        news_articles, error = climate_service.get_climate_news(
            location=user_location.strip(), 
            category=category.strip()
        )

        if error:
            return jsonify({"error": error}), 500
        
        return jsonify(news_articles), 200
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# --- RESPOND ROUTES ---
@climate_blueprint.route('/respond/shelters', methods=['GET'])
def handle_get_shelters():
    """Get all emergency shelters"""
    try:
        shelters, error = climate_service.get_all_shelters()
        if error:
            return jsonify({"error": error}), 500
        return jsonify(shelters), 200
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@climate_blueprint.route('/respond/sos', methods=['POST'])
def handle_sos_alert():
    """Create a new SOS alert"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'phone', 'location', 'emergency_type', 'message']
        if not data:
            return jsonify({"error": "Request body is required"}), 400
            
        missing_fields = [field for field in required_fields if not data.get(field, '').strip()]
        if missing_fields:
            return jsonify({
                "error": f"Missing or empty required fields: {', '.join(missing_fields)}"
            }), 400

        # Validate phone number
        if not climate_service.validate_phone_number(data['phone']):
            return jsonify({"error": "Invalid phone number format"}), 400

        # Validate emergency type
        valid_types = ['medical', 'fire', 'flood', 'earthquake', 'trapped', 'other']
        if data['emergency_type'].lower() not in valid_types:
            return jsonify({
                "error": f"Invalid emergency type. Must be one of: {', '.join(valid_types)}"
            }), 400

        sos_alert, error = climate_service.create_sos_alert(
            name=data['name'].strip(),
            phone=data['phone'].strip(),
            location=data['location'].strip(),
            emergency_type=data['emergency_type'].strip().lower(),
            message=data['message'].strip()
        )
        
        if error:
            return jsonify({"error": error}), 500
            
        return jsonify({
            "message": "SOS alert sent successfully",
            "alert_id": sos_alert.get('id'),
            "status": "active"
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# --- RECOVER ROUTES ---
@climate_blueprint.route('/recover/request-aid', methods=['POST'])
def handle_add_aid_request():
    """Create a new aid request"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'location', 'aid_needed']
        if not data:
            return jsonify({"error": "Request body is required"}), 400
            
        missing_fields = [field for field in required_fields if not data.get(field, '').strip()]
        if missing_fields:
            return jsonify({
                "error": f"Missing or empty required fields: {', '.join(missing_fields)}"
            }), 400
    
        new_request, error = climate_service.add_aid_request(
            name=data['name'].strip(),
            location=data['location'].strip(), 
            aid_needed=data['aid_needed'].strip()
        )
        
        if error:
            return jsonify({"error": error}), 500
            
        return jsonify({
            "message": "Aid request submitted successfully",
            "request_id": new_request.get('id'),
            "status": "pending"
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@climate_blueprint.route('/recover/organizations', methods=['GET'])
def handle_get_organizations():
    """Get all active recovery organizations"""
    try:
        organizations, error = climate_service.get_all_organizations()
        if error:
            return jsonify({"error": error}), 500
        return jsonify(organizations), 200
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# --- UTILITY ROUTES ---
@climate_blueprint.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ClimaAid API",
        "version": "1.0.0"
    }), 200

@climate_blueprint.route('/test/db', methods=['GET'])
def test_database_connection():
    """Test database connectivity"""
    try:
        # Try to fetch one instruction to test DB connection
        instructions, error = climate_service.get_all_instructions()
        if error:
            return jsonify({
                "status": "error",
                "database": "disconnected",
                "error": error
            }), 500
        
        return jsonify({
            "status": "success",
            "database": "connected",
            "sample_data_count": len(instructions) if instructions else 0
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error", 
            "database": "disconnected",
            "error": str(e)
        }), 500
