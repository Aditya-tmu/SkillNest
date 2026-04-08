import google.generativeai as genai
import os
import json
import re
from django.conf import settings

def get_gemini_client():
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash')

def generate_mcqs(skill_name, level):
    try:
        model = get_gemini_client()
        prompt = f"""
        Generate 10 multiple-choice questions for the skill '{skill_name}' at '{level}' level.
        The output must be a valid JSON array of objects.
        Do not include any other text, markdown formatting, or explanations. Just the JSON.
        Each object must have:
        - 'question': The question text
        - 'options': A list of 4 strings
        - 'correct_answer': The index of the correct option (0-3)
        
        Example:
        [
          {{
            "question": "What is React?",
            "options": ["Library", "Framework", "Database", "Language"],
            "correct_answer": 0
          }}
        ]
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # More robust JSON extraction
        json_match = re.search(r'\[\s*{.*}\s*\]', text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            # Fallback if the whole text is just the array
            json_text = text
            if json_text.startswith("```json"):
                json_text = json_text[7:-3].strip()
            elif json_text.startswith("```"):
                json_text = json_text[3:-3].strip()
                
        return json.loads(json_text)
    except Exception as e:
        print(f"Error in generate_mcqs: {str(e)}")
        # If possible, print response.text for more context
        try:
            print(f"Full response text: {response.text}")
        except:
            pass
        return None
