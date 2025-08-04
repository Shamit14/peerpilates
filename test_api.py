#!/usr/bin/env python3

import requests
import json

def test_gemini_api():
    """Test the Gemini API integration"""
    
    # Test the test endpoint
    print("Testing Gemini API status...")
    response = requests.post("http://localhost:8000/api/ai-agent/test")
    print("Status:", response.json())
    print()
    
    # Test the chat endpoint
    print("Testing chat with Gemini API...")
    chat_data = {
        "message": "What is the best strategy for UPSC preparation?",
        "subject": "UPSC"
    }
    
    response = requests.post(
        "http://localhost:8000/api/ai-agent/chat",
        json=chat_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print("Response received!")
        print("Source:", result.get("source", "unknown"))
        print("Response:", result.get("response", "No response")[:200] + "...")
    else:
        print("Error:", response.status_code)
        print("Details:", response.text)

if __name__ == "__main__":
    test_gemini_api()
