# backend/services/answer_evaluator.py
from groq import Groq
import logging
from typing import Dict, Any
import json

logger = logging.getLogger(__name__)

def evaluate_answer(
    question: str,
    answer: str,
    category: str,
    api_key: str
) -> Dict[str, Any]:
    """Evaluate an interview answer using AI"""
    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""Evaluate this interview answer and return ONLY a JSON object:

Question: {question}
Answer: {answer}
Category: {category}

Return JSON with this EXACT structure:
{{
  "overallScore": 75,
  "breakdown": {{
    "technicalAccuracy": 25,
    "communicationClarity": 20,
    "answerCompleteness": 20,
    "confidence": 10
  }},
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "feedback": "Detailed feedback paragraph",
  "betterAnswer": "An improved version of the answer"
}}

Scoring (out of 100):
- technicalAccuracy: 0-25 points
- communicationClarity: 0-25 points  
- answerCompleteness: 0-25 points
- confidence: 0-25 points

Return ONLY the JSON, nothing else."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert interview evaluator. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.4
        )
        
        result = response.choices[0].message.content.strip()
        
        # Clean markdown if present
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        
        evaluation = json.loads(result)
        logger.info(f"Answer evaluated: {evaluation.get('overallScore')}/100")
        return evaluation
        
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        return {
            "overallScore": 50,
            "breakdown": {
                "technicalAccuracy": 12,
                "communicationClarity": 12,
                "answerCompleteness": 13,
                "confidence": 13
            },
            "strengths": ["Attempted to answer the question"],
            "improvements": ["Could provide more detail"],
            "feedback": "Unable to fully evaluate this answer.",
            "betterAnswer": "A more comprehensive answer would include specific examples and technical details."
        }