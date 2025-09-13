# services/climate_service.py
from config import supabase # This assumes your supabase client is in config.py

# --- PREPARE ---
def get_all_instructions():
    try:
        response = supabase.table('instructions').select("*").execute()
        return response.data, None
    except Exception as e:
        return None, str(e)

def get_all_kit_items():
    try:
        response = supabase.table('kit_items').select("*").execute()
        return response.data, None
    except Exception as e:
        return None, str(e)

# --- RESPOND ---
def get_all_shelters():
    """Fetches all shelter locations."""
    try:
        # We only select the columns needed for the map
        response = supabase.table('shelters').select("id, name, latitude, longitude, capacity, is_open").execute()
        return response.data, None
    except Exception as e:
        return None, str(e)

# --- RECOVER ---
def add_aid_request(name, location, aid_needed):
    """Adds a new aid request to the database."""
    try:
        data_to_insert = {
            "requester_name": name,
            "location_description": location,
            "aid_needed": aid_needed
        }
        response = supabase.table('aid_requests').insert(data_to_insert).execute()
        return response.data[0], None
    except Exception as e:
        return None, str(e)

def get_all_organizations():
    try:
        response = supabase.table('organizations').select("*").execute()
        return response.data, None
    except Exception as e:
        return None, str(e)
