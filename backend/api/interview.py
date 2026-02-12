from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
import uuid
from datetime import datetime
from services.question_generator import QuestionGenerator

router = APIRouter()

# In-memory storage for demo (replace with Firebase in production)
interviews_db = {}

@router.post("/create")
async def create_interview(
    interview_type: str = Query(..., description="Type of interview"),
    difficulty: str = Query(..., description="Difficulty level"),
    basis: str = Query(..., description="Basis: resume, jd, both"),
    timing: str = Query(..., description="Timing: now, later"),
    save_for_days: Optional[int] = Query(None, description="Days to save if timing is later"),
    resume_data: Optional[Dict] = None,
    jd_data: Optional[Dict] = None,
    api_key: str = Query(..., description="Groq API key")
):
    """Create a new interview session"""
    try:
        # Generate interview ID
        interview_id = str(uuid.uuid4())
        
        # Determine question count based on difficulty
        question_counts = {
            "easy": 5,
            "medium": 8,
            "hard": 12,
            "expert": 15
        }
        count = question_counts.get(difficulty, 8)
        
        # Generate questions
        generator = QuestionGenerator()
        questions = generator.generate_questions(
            interview_type=interview_type,
            difficulty=difficulty,
            count=count,
            resume_data=resume_data,
            jd_data=jd_data,
            api_key=api_key
        )
        
        # Create interview object
        interview = {
            "id": interview_id,
            "type": interview_type,
            "difficulty": difficulty,
            "basis": basis,
            "timing": timing,
            "saveForDays": save_for_days,
            "questions": questions,
            "status": "created",
            "createdAt": datetime.now().isoformat(),
            "currentQuestionIndex": 0,
            "answers": [],
            "resumeData": resume_data,
            "jdData": jd_data
        }
        
        # Store interview
        interviews_db[interview_id] = interview
        
        return {
            "interviewId": interview_id,
            "questionCount": len(questions),
            "message": "Interview created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview creation failed: {str(e)}")

@router.get("/{interview_id}")
async def get_interview(interview_id: str):
    """Get interview details"""
    if interview_id not in interviews_db:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return interviews_db[interview_id]

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    question_id: str = Query(..., description="Question ID"),
    answer_text: str = Query(..., description="Answer text"),
    audio_duration: Optional[float] = Query(None, description="Audio duration in seconds"),
    filler_words: Optional[Dict] = None,
    api_key: str = Query(..., description="Groq API key")
):
    """Submit an answer for evaluation"""
    try:
        if interview_id not in interviews_db:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview = interviews_db[interview_id]
        
        # Find the question
        question = None
        for q in interview["questions"]:
            if q["questionId"] == question_id:
                question = q
                break
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Evaluate answer
        from services.answer_evaluator import evaluate_answer
        
        evaluation = evaluate_answer(
            question_text=question["questionText"],
            answer_text=answer_text,
            api_key=api_key
        )
        
        # Add filler word analysis if provided
        if filler_words:
            evaluation["fillerWords"] = filler_words
        
        # Store answer
        answer = {
            "questionId": question_id,
            "answerText": answer_text,
            "evaluation": evaluation,
            "timestamp": datetime.now().isoformat(),
            "audioDuration": audio_duration
        }
        
        interview["answers"].append(answer)
        interview["currentQuestionIndex"] = len(interview["answers"])
        
        # Check if interview is complete
        if len(interview["answers"]) >= len(interview["questions"]):
            interview["status"] = "completed"
        
        return {
            "evaluation": evaluation,
            "nextQuestionIndex": interview["currentQuestionIndex"],
            "isComplete": interview["status"] == "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Answer submission failed: {str(e)}")

@router.post("/{interview_id}/complete")
async def complete_interview(interview_id: str):
    """Mark interview as complete and generate report"""
    try:
        if interview_id not in interviews_db:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview = interviews_db[interview_id]
        interview["status"] = "completed"
        interview["completedAt"] = datetime.now().isoformat()
        
        # Generate final report
        report = generate_interview_report(interview)
        
        return {
            "report": report,
            "message": "Interview completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview completion failed: {str(e)}")

def generate_interview_report(interview: Dict[str, Any]) -> Dict[str, Any]:
    """Generate comprehensive interview report"""
    answers = interview.get("answers", [])
    
    if not answers:
        return {"error": "No answers found"}
    
    # Calculate overall scores
    total_score = 0
    category_scores = {"technical": 0, "communication": 0, "behavioral": 0, "confidence": 0}
    filler_word_counts = {"um": 0, "uh": 0, "like": 0, "youKnow": 0}
    
    for answer in answers:
        eval_data = answer.get("evaluation", {})
        total_score += eval_data.get("overallScore", 0)
        
        # Category scores
        for category in category_scores:
            category_scores[category] += eval_data.get(f"{category}Score", 0)
        
        # Filler words
        fillers = eval_data.get("fillerWords", {})
        for word in filler_word_counts:
            filler_word_counts[word] += fillers.get(word, 0)
    
    # Average scores
    num_answers = len(answers)
    overall_score = round(total_score / num_answers, 1)
    
    for category in category_scores:
        category_scores[category] = round(category_scores[category] / num_answers, 1)
    
    # Generate insights
    strengths = []
    improvements = []
    
    if overall_score >= 80:
        strengths.append("Strong overall performance")
    if category_scores["technical"] >= 75:
        strengths.append("Excellent technical knowledge")
    if category_scores["communication"] >= 75:
        strengths.append("Clear and effective communication")
    if category_scores["confidence"] >= 75:
        strengths.append("High confidence level")
    
    if category_scores["technical"] < 60:
        improvements.append("Focus on strengthening technical knowledge")
    if category_scores["communication"] < 60:
        improvements.append("Work on communication clarity")
    if sum(filler_word_counts.values()) > 10:
        improvements.append("Reduce filler words (um, uh, like)")
    
    return {
        "overallScore": overall_score,
        "categoryScores": category_scores,
        "fillerWords": filler_word_counts,
        "totalFillerWords": sum(filler_word_counts.values()),
        "questionCount": len(answers),
        "strengths": strengths,
        "improvements": improvements,
        "completedAt": interview.get("completedAt")
    }
