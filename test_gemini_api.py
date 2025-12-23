import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test Gemini API connection"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    print(f"🔑 Testing Gemini API Key: {api_key[:10]}...{api_key[-10:] if len(api_key) > 20 else api_key}")
    
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
        # List available models to test connection
        print("📋 Available models:")
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
        
        # Test a simple generation
        # Test with a simple question
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Say hello in one sentence.")
        
        print(f"✅ API Test Successful!")
        print(f"🎯 Response: {response.text}")
        return True
        
    except Exception as e:
        print(f"❌ API Test Failed: {e}")
        print("\n🛠️ To fix this:")
        print("1. Go to https://makersuite.google.com/app/apikey")
        print("2. Create a new API key")
        print("3. Update your .env file with the new key")
        print("4. Make sure you have access to Gemini API in your region")
        return False

if __name__ == "__main__":
    test_gemini_api()