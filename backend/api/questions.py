from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from services.question_generator import QuestionGenerator

router = APIRouter()

@router.post("/generate")
async def generate_questions(
    interview_type: str = Query(..., description="Type of interview"),
    difficulty: str = Query(..., description="Difficulty level"),
    count: int = Query(..., description="Number of questions to generate"),
    resume_data: Optional[Dict] = None,
    jd_data: Optional[Dict] = None,
    api_key: str = Query(..., description="Groq API key")
):
    """Generate interview questions"""
    try:
        generator = QuestionGenerator()
        questions = generator.generate_questions(
            interview_type=interview_type,
            difficulty=difficulty,
            count=count,
            resume_data=resume_data,
            jd_data=jd_data,
            api_key=api_key
        )

        return {
            "questions": questions,
            "count": len(questions),
            "interviewType": interview_type,
            "difficulty": difficulty
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

@router.get("/bank/stats")
async def get_question_bank_stats():
    """Get statistics about the question bank"""
    try:
        from services.question_generator import question_bank

        stats = {}
        for category, difficulties in question_bank.items():
            stats[category] = {}
            for difficulty, questions in difficulties.items():
                stats[category][difficulty] = len(questions)

        return {
            "totalQuestions": sum(sum(cat.values()) for cat in stats.values()),
            "categories": stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
