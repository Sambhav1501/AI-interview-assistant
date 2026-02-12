from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import uuid
from datetime import datetime

router = APIRouter()

# In-memory storage for demo (replace with Firebase in production)
reports_db = {}

@router.post("/generate")
async def generate_report(interview_data: Dict[str, Any]):
    """Generate a comprehensive interview feedback report"""
    try:
        report_id = str(uuid.uuid4())
        
        # Generate report from interview data
        report = create_feedback_report(interview_data)
        
        # Store report
        report["id"] = report_id
        report["createdAt"] = datetime.now().isoformat()
        reports_db[report_id] = report
        
        return {
            "reportId": report_id,
            "report": report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/{report_id}")
async def get_report(report_id: str):
    """Get a feedback report by ID"""
    if report_id not in reports_db:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return reports_db[report_id]

@router.get("/")
async def get_all_reports():
    """Get all feedback reports (for demo purposes)"""
    return {
        "reports": list(reports_db.values()),
        "count": len(reports_db)
    }

def create_feedback_report(interview_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a detailed feedback report from interview data"""
    answers = interview_data.get("answers", [])
    
    if not answers:
        return {
            "error": "No answers found to generate report",
            "overallScore": 0,
            "categoryScores": {},
            "strengths": [],
            "improvements": []
        }
    
    # Calculate overall metrics
    total_score = 0
    category_scores = {
        "technical": 0,
        "communication": 0,
        "behavioral": 0,
        "confidence": 0
    }
    filler_word_counts = {"um": 0, "uh": 0, "like": 0, "youKnow": 0}
    
    question_details = []
    
    for i, answer in enumerate(answers):
        eval_data = answer.get("evaluation", {})
        
        # Accumulate scores
        overall_score = eval_data.get("overallScore", 0)
        total_score += overall_score
        
        for category in category_scores:
            category_scores[category] += eval_data.get(f"{category}Score", 0)
        
        # Filler words
        fillers = eval_data.get("fillerWords", {})
        for word in filler_word_counts:
            filler_word_counts[word] += fillers.get(word, 0)
        
        # Question details
        question_details.append({
            "questionNumber": i + 1,
            "questionText": answer.get("questionText", ""),
            "score": overall_score,
            "feedback": eval_data.get("feedback", ""),
            "strengths": eval_data.get("strengths", []),
            "improvements": eval_data.get("improvements", [])
        })
    
    # Calculate averages
    num_answers = len(answers)
    avg_overall_score = round(total_score / num_answers, 1)
    
    for category in category_scores:
        category_scores[category] = round(category_scores[category] / num_answers, 1)
    
    total_filler_words = sum(filler_word_counts.values())
    
    # Generate insights
    strengths = []
    improvements = []
    
    # Overall performance insights
    if avg_overall_score >= 85:
        strengths.append("Outstanding overall performance")
    elif avg_overall_score >= 75:
        strengths.append("Strong overall performance")
    elif avg_overall_score >= 60:
        strengths.append("Good overall performance")
    else:
        improvements.append("Overall performance needs improvement")
    
    # Category-specific insights
    if category_scores["technical"] >= 80:
        strengths.append("Excellent technical knowledge and accuracy")
    elif category_scores["technical"] < 60:
        improvements.append("Focus on improving technical knowledge")
    
    if category_scores["communication"] >= 80:
        strengths.append("Clear and effective communication skills")
    elif category_scores["communication"] < 60:
        improvements.append("Work on communication clarity and structure")
    
    if category_scores["behavioral"] >= 80:
        strengths.append("Strong behavioral and situational responses")
    elif category_scores["behavioral"] < 60:
        improvements.append("Practice behavioral interview techniques (STAR method)")
    
    if category_scores["confidence"] >= 80:
        strengths.append("High confidence and poise throughout")
    elif category_scores["confidence"] < 60:
        improvements.append("Build confidence through practice")
    
    # Filler word insights
    if total_filler_words > 15:
        improvements.append("Significantly reduce filler words (um, uh, like)")
    elif total_filler_words > 8:
        improvements.append("Reduce filler words to sound more polished")
    else:
        strengths.append("Minimal use of filler words")
    
    # Performance distribution
    score_distribution = {
        "excellent": len([a for a in answers if a.get("evaluation", {}).get("overallScore", 0) >= 85]),
        "good": len([a for a in answers if 70 <= a.get("evaluation", {}).get("overallScore", 0) < 85]),
        "average": len([a for a in answers if 50 <= a.get("evaluation", {}).get("overallScore", 0) < 70]),
        "needs_improvement": len([a for a in answers if a.get("evaluation", {}).get("overallScore", 0) < 50])
    }
    
    return {
        "overallScore": avg_overall_score,
        "categoryScores": category_scores,
        "fillerWords": filler_word_counts,
        "totalFillerWords": total_filler_words,
        "questionCount": num_answers,
        "scoreDistribution": score_distribution,
        "strengths": strengths,
        "improvements": improvements,
        "questionDetails": question_details,
        "interviewType": interview_data.get("type", "unknown"),
        "difficulty": interview_data.get("difficulty", "unknown"),
        "recommendations": generate_recommendations(avg_overall_score, category_scores, total_filler_words)
    }

def generate_recommendations(overall_score: float, category_scores: Dict[str, float], filler_words: int) -> list:
    """Generate personalized recommendations"""
    recommendations = []
    
    if overall_score < 70:
        recommendations.append("Practice more interview questions to build confidence and knowledge")
        recommendations.append("Record yourself answering questions to identify areas for improvement")
    
    if category_scores["technical"] < 70:
        recommendations.append("Review technical concepts and practice explaining them clearly")
        recommendations.append("Focus on understanding fundamentals before diving into complex topics")
    
    if category_scores["communication"] < 70:
        recommendations.append("Practice speaking clearly and structuring your answers with STAR method")
        recommendations.append("Work on eliminating filler words and speaking more deliberately")
    
    if category_scores["behavioral"] < 70:
        recommendations.append("Study behavioral interview questions and prepare specific examples")
        recommendations.append("Use the STAR method (Situation, Task, Action, Result) for all answers")
    
    if filler_words > 10:
        recommendations.append("Practice speaking without filler words - take pauses instead")
        recommendations.append("Record practice sessions and count filler words to track improvement")
    
    if overall_score >= 80:
        recommendations.append("Continue practicing to maintain high performance")
        recommendations.append("Focus on advanced topics and complex scenarios")
    
    return recommendations
