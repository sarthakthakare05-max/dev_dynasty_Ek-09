import requests

print("--- DIAGNOSTIC START ---")

API_URL = "http://localhost:8000"

# 1. Check Root
try:
    r = requests.get(f"{API_URL}/")
    print(f"Root Check: {r.status_code} (Expect 200)")
except Exception as e:
    print(f"Root Check FAILED: {e}")

# 2. Check CORS for Resume Upload
try:
    headers = {
        "Origin": "http://localhost:5500",
        "Access-Control-Request-Method": "POST",
    }
    r = requests.options(f"{API_URL}/resumes/", headers=headers)
    print(f"CORS Check Status: {r.status_code} (Expect 200)")
    print(f"CORS Allow Origin: {r.headers.get('Access-Control-Allow-Origin')}")
    print(f"CORS Allow Methods: {r.headers.get('Access-Control-Allow-Methods')}")
    
    if r.headers.get('Access-Control-Allow-Origin') == '*':
        print("SUCCESS: CORS seems correctly configured for wildcard.")
    else:
        print("WARNING: CORS header might be missing or restricted.")
        
except Exception as e:
    print(f"CORS Check FAILED: {e}")

print("--- DIAGNOSTIC END ---")
