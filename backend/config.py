# config.py
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Initialize the Supabase client ONCE
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)
