import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    models = response.json().get('models', [])
    print("Available Models:")
    for m in models:
        print(f" - {m.get('name')}")
else:
    print(response.text)
