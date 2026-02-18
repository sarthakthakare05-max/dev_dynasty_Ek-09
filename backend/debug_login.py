import requests
import json

API_URL = "http://localhost:8000/auth/login"

# Matches the user created in debug_register_v2.py
payload = {
    "email": "test_fixed_frontend@test.com",
    "password": "password123"
}

try:
    print(f"Sending LOGIN request to {API_URL}...")
    response = requests.post(API_URL, json=payload)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("\nSUCCESS: Login worked!")
    else:
        print("\nFAILURE: Login failed.")

except Exception as e:
    print(f"\nEXCEPTION: {e}")
