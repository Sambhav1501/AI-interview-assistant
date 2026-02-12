# backend/api/resume.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import logging
import os
from pathlib import Path
import shutil
from services import resume_parser

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """Analyze a resume PDF and return ATS score and suggestions"""
    
    # Validate file
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save file temporarily
    file_path = UPLOAD_DIR / file.filename
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"📄 Analyzing resume: {file.filename}")
        
        # Get API key from environment (in production, pass from frontend)
        groq_api_key = os.getenv("GROQ_API_KEY", "")
        
        # Parse resume
        parsed_data = resume_parser.parse_resume(str(file_path), groq_api_key)
        
        # Calculate ATS score
        ats_result = calculate_ats_score(parsed_data, groq_api_key)
        
        # Generate response
        result = {
            "atsScore": ats_result["score"],
            "parsedData": parsed_data,
            "strengths": ats_result["strengths"],
            "weaknesses": ats_result["weaknesses"],
            "suggestions": ats_result["suggestions"],
            "skills": parsed_data.get("skills", []),
            "missingKeywords": ats_result.get("missingKeywords", [])
        }
        
        logger.info(f"✅ Analysis complete. ATS Score: {result['atsScore']}")
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"❌ Error analyzing resume: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up uploaded file
        if file_path.exists():
            file_path.unlink()

def calculate_ats_score(parsed_data: dict, api_key: str) -> dict:
    """Calculate ATS score using AI"""
    from groq import Groq
    import json
    
    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""Analyze this resume data and provide an ATS compatibility score.

Resume Data:
- Skills: {', '.join(parsed_data.get('skills', []))}
- Experience: {len(parsed_data.get('experience', []))} roles
- Education: {len(parsed_data.get('education', []))} degrees
- Projects: {len(parsed_data.get('projects', []))} projects

Return ONLY a JSON object with this structure:
{{
  "score": 75,
  "strengths": ["Clear skills section", "Quantified achievements", "Strong technical background"],
  "weaknesses": ["Missing industry keywords", "No summary section", "Inconsistent formatting"],
  "suggestions": ["Add professional summary", "Include more metrics", "Optimize keywords"],
  "missingKeywords": ["AWS", "Docker", "CI/CD"]
}}

Score criteria (0-100):
- Has skills section: +20
- Has work experience: +20
- Has education: +15
- Has projects: +10
- Quantified achievements: +15
- Good formatting: +10
- Industry keywords: +10

Return ONLY the JSON, no other text."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an ATS scoring expert. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        result = response.choices[0].message.content.strip()
        
        # Clean markdown if present
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        
        return json.loads(result)
        
    except Exception as e:
        logger.error(f"Error calculating ATS score: {e}")
        return {
            "score": 50,
            "strengths": ["Resume uploaded successfully"],
            "weaknesses": ["Unable to fully analyze"],
            "suggestions": ["Try uploading again"],
            "missingKeywords": []
        }