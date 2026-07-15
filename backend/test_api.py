import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000/api/v1/evaluate"

def test_api():
    print("Testing evaluate endpoint...")
    payload = {"repo_url": "https://github.com/tiangolo/fastapi"}
    response = requests.post(f"{BASE_URL}/", json=payload)
    
    if response.status_code != 200:
        print(f"Error starting task: {response.text}")
        return
        
    data = response.json()
    task_id = data.get("task_id")
    print(f"Task started successfully. Task ID: {task_id}")
    
    status = "PENDING"
    while status not in ["SUCCESS", "FAILURE"]:
        time.sleep(5)
        res = requests.get(f"{BASE_URL}/status/{task_id}")
        res_data = res.json()
        status = res_data.get("status")
        print(f"Current status: {status}")
        
    if status == "SUCCESS":
        print("Final Report:")
        print(json.dumps(res_data.get("result", {}).get("final_report"), indent=2))
    else:
        print(f"Task failed: {res_data.get('error')}")

if __name__ == "__main__":
    test_api()
