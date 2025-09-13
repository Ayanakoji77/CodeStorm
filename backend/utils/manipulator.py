# utils/manipulator.py

def format_country_for_display(country_data):
    """Takes country data and adds a formatted display name."""
    if not country_data:
        return None
    
    # Create a new dictionary to avoid changing the original
    formatted = country_data.copy()
    formatted['display_name'] = f"{formatted['name'].upper()} ({formatted['continent']})"
    return formatted
