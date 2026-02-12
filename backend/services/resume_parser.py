# backend/services/resume_parser.py
import PyPDF2
from groq import Groq
import logging
from typing import Dict, Any
import json

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""

def parse_resume_with_ai(resume_text: str, api_key: str) -> Dict[str, Any]:
    """Parse resume using Groq AI"""
    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""Extract information from this resume and return ONLY a JSON object with this exact structure:
{{
  "personalInfo": {{
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "linkedin": "linkedin url",
    "github": "github url"
  }},
  "summary": "Professional summary",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Start - End",
      "achievements": ["achievement1", "achievement2"]
    }}
  ],
  "education": [
    {{
      "institution": "School Name",
      "degree": "Degree",
      "field": "Field of Study",
      "graduationYear": "Year"
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Description",
      "technologies": ["tech1", "tech2"]
    }}
  ]
}}

Resume text:
{resume_text}

Return ONLY the JSON, no other text."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a resume parser. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.3
        )
        
        result = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        
        parsed_data = json.loads(result)
        logger.info("Resume parsed successfully")
        return parsed_data
        
    except Exception as e:
        logger.error(f"Error parsing resume with AI: {e}")
        return {
            "personalInfo": {},
            "summary": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": []
        }

def parse_resume(file_path: str, api_key: str) -> Dict[str, Any]:
    """Main function to parse resume"""
    # Extract text
    resume_text = extract_text_from_pdf(file_path)
    
    if not resume_text:
        return {"error": "Could not extract text from PDF"}
    
    # Parse with AI
    parsed_data = parse_resume_with_ai(resume_text, api_key)
    
    return parsed_data