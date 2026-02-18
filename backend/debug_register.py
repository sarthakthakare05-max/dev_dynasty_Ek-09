import requests
import json

API_URL = "http://localhost:8000/auth/register"

payload = {
    "email": "test_debug@test.com",
    "password": "password123",
    "role": "student"
}

try:
    print(f"Sending POST request to {API_URL}...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(API_URL, json=payload)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("\nSUCCESS: Registration worked!")
    else:
        print("\nFAILURE: Registration failed.")
        
except Exception as e:
    print(f"\nEXCEPTION: {e}")
