# services/climate_service.py - Updated to match Supabase schema exactly
from config import supabase
import requests
import os
from datetime import datetime

# --- PREPARE ---
def get_all_instructions():
    """Get all safety instructions from database"""
    try:
        response = supabase.table('instructions').select("id, title, content, disaster_type").execute()
        return response.data, None
    except Exception as e:
        return None, str(e)

def get_all_kit_items():
    """Get all emergency kit items from database"""
    try:
        response = supabase.table('kit_items').select("id, item_name, description, category").execute()
        return response.data, None
    except Exception as e:
        return None, str(e)

def get_climate_news(location="India", category="disaster"):
    """Fetch climate-related news using NewsAPI"""
    try:
        api_key = os.getenv("NEWS_API_KEY")
        if not api_key:
            return None, "News API key is not configured."

        # Enhanced keywords for better disaster coverage
        keywords = '"flood" OR "flooding" OR "heatwave" OR "heat wave" OR "earthquake" OR "cyclone" OR "hurricane" OR "typhoon" OR "wildfire" OR "drought" OR "tsunami" OR "landslide" OR "climate change" OR "extreme weather"'
        location_filter = f'"{location}"'
        final_query = f'({keywords}) AND ({location_filter})'
        
        url = f'https://newsapi.org/v2/everything?q={final_query}&sortBy=publishedAt&language=en&pageSize=20&apiKey={api_key}'
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        articles = data.get('articles', [])
        
        # Filter out articles with missing essential data
        filtered_articles = []
        for article in articles:
            if (article.get('title') and 
                article.get('url') and 
                article.get('publishedAt') and 
                article.get('source', {}).get('name')):
                filtered_articles.append(article)
        
        return filtered_articles, None
    except requests.exceptions.RequestException as e:
        return None, f"Network error: {str(e)}"
    except Exception as e:
        return None, f"Error fetching news: {str(e)}"

# --- RESPOND ---
def get_all_shelters():
    """Get all emergency shelters with exact schema fields"""
    try:
        # Note: You need to create this table if it doesn't exist
        response = supabase.table('shelters').select("id, name, latitude, longitude, capacity, is_open").execute()
        return response.data, None
    except Exception as e:
        return None, f"Error fetching shelters: {str(e)}"

def create_sos_alert(name, phone, location, emergency_type, message):
    """Create a new SOS alert with exact schema fields"""
    try:
        data_to_insert = {
            "name": name,
            "phone": phone,
            "location": location,
            "emergency_type": emergency_type,
            "message": message,
            "status": "active",  # Default from schema
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        response = supabase.table('sos_alerts').insert(data_to_insert).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0], None
        else:
            return None, "Failed to create SOS alert"
            
    except Exception as e:
        return None, f"Error creating SOS alert: {str(e)}"

# --- RECOVER ---
def add_aid_request(name, location, aid_needed):
    """Create aid request with exact schema field names"""
    try:
        data_to_insert = {
            "requester_name": name,  # Matches schema exactly
            "location_description": location,  # Matches schema exactly
            "aid_needed": aid_needed,  # Matches schema exactly
            "status": "pending",  # Default from schema
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        response = supabase.table('aid_requests').insert(data_to_insert).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0], None
        else:
            return None, "Failed to create aid request"
            
    except Exception as e:
        return None, f"Error creating aid request: {str(e)}"

def get_all_organizations():
    """Get all recovery organizations with exact schema fields"""
    try:
        response = supabase.table('organizations').select(
            "id, name, type, description, contact, email, website, address, latitude, longitude, is_active"
        ).eq('is_active', True).execute()  # Only get active organizations
        
        return response.data, None
    except Exception as e:
        return None, f"Error fetching organizations: {str(e)}"

# --- UTILITY FUNCTIONS ---
def validate_phone_number(phone):
    """Basic phone number validation"""
    import re
    # Remove all non-digit characters
    cleaned = re.sub(r'\D', '', phone)
    # Check if it's a valid length (10-15 digits)
    return 10 <= len(cleaned) <= 15

def validate_coordinates(lat, lng):
    """Validate latitude and longitude"""
    try:
        lat_float = float(lat)
        lng_float = float(lng)
        return (-90 <= lat_float <= 90) and (-180 <= lng_float <= 180)
    except (ValueError, TypeError):
        return False
