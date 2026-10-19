import os
import requests
from dotenv import load_dotenv

load_dotenv()

groq_key = os.getenv("GROQ_API_KEY")
nara_key = os.getenv("NARAROUTER_API_KEY") or os.getenv("NARA_ROUTER_API_KEY")

print("--- Checking Groq & NaraRouter API Configuration ---")
if groq_key:
    print(f"Groq API Key: {groq_key[:6]}...{groq_key[-4:]} [CONFIGURED]")
else:
    print("Groq API Key: [NOT SET]")

if nara_key:
    print(f"NaraRouter API Key: {nara_key[:6]}...{nara_key[-4:]} [CONFIGURED]")
else:
    print("NaraRouter API Key: [NOT SET]")
