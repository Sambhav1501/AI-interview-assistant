# backend/services/question_generator.py
import json
import os
from pathlib import Path
from typing import List, Dict, Any
from groq import Groq
import logging

logger = logging.getLogger(__name__)

# Question bank storage
QUESTION_BANK_FILE = Path(__file__).parent.parent / "data" / "question_bank.json"
question_bank = {}

async def load_question_bank():
    """Load question bank from JSON file"""
    global question_bank
    
    try:
        if QUESTION_BANK_FILE.exists():
            with open(QUESTION_BANK_FILE, 'r') as f:
                question_bank = json.load(f)
            logger.info(f"Loaded {len(question_bank)} questions from bank")
        else:
            # Create default question bank
            question_bank = {
                "technical": {
                    "easy": [
                        "What is the difference between a list and a tuple in Python?",
                        "Explain what a REST API is.",
                        "What is the purpose of version control systems like Git?",
                        "What is the difference between HTTP and HTTPS?",
                        "Explain what a database index is."
                    ],
                    "medium": [
                        "How would you implement a caching mechanism in a web application?",
                        "Explain the concept of Object-Oriented Programming and its key principles.",
                        "What are the differences between SQL and NoSQL databases?",
                        "How does garbage collection work in programming languages?",
                        "Describe the MVC architecture pattern.",
                        "What is the difference between authentication and authorization?",
                        "Explain how you would optimize a slow database query.",
                        "What are microservices and what are their advantages?"
                    ],
                    "hard": [
                        "Design a URL shortening service like bit.ly. What are the key considerations?",
                        "How would you design a distributed caching system?",
                        "Explain the CAP theorem and its implications for distributed systems.",
                        "How would you implement a rate limiter for an API?",
                        "Design a notification system that can handle millions of users.",
                        "What strategies would you use to handle database scaling?",
                        "Explain how you would implement real-time search functionality.",
                        "How would you design a social media feed ranking algorithm?",
                        "Describe how you would build a fault-tolerant messaging queue.",
                        "What are the trade-offs between consistency and availability?",
                        "How would you implement a distributed locking mechanism?",
                        "Design a system to detect anomalies in real-time streaming data."
                    ],
                    "expert": [
                        "Design a globally distributed database that ensures consistency across regions.",
                        "How would you architect a system to handle 10 million concurrent WebSocket connections?",
                        "Explain how you would build a real-time collaborative editing system like Google Docs.",
                        "Design a recommendation engine that can process billions of user interactions.",
                        "How would you implement a distributed transaction system across multiple databases?",
                        "Architect a video streaming platform that can handle millions of concurrent viewers.",
                        "Design a fraud detection system for real-time financial transactions.",
                        "How would you build a search engine from scratch?",
                        "Explain your approach to designing a distributed file storage system like Dropbox.",
                        "Design a machine learning pipeline for real-time predictions at scale.",
                        "How would you architect a multi-tenant SaaS platform with data isolation?",
                        "Design a real-time analytics system processing terabytes of data daily.",
                        "How would you implement a distributed consensus algorithm?",
                        "Design a global CDN with edge computing capabilities.",
                        "Architect a system for real-time language translation at scale."
                    ]
                },
                "behavioral": {
                    "easy": [
                        "Tell me about yourself.",
                        "Why are you interested in this position?",
                        "What are your greatest strengths?",
                        "Where do you see yourself in 5 years?",
                        "Why should we hire you?"
                    ],
                    "medium": [
                        "Tell me about a time when you had to work with a difficult team member.",
                        "Describe a situation where you had to meet a tight deadline.",
                        "Give me an example of a time you showed leadership.",
                        "Tell me about a time you failed and what you learned from it.",
                        "Describe a situation where you had to learn something new quickly.",
                        "Tell me about a conflict you had at work and how you resolved it.",
                        "Give me an example of when you went above and beyond.",
                        "Describe a time when you had to make a difficult decision."
                    ],
                    "hard": [
                        "Tell me about a time when you had to influence others without formal authority.",
                        "Describe a situation where you had to balance multiple conflicting priorities.",
                        "Give me an example of when you had to disagree with your manager's decision.",
                        "Tell me about a time when you had to deliver bad news to stakeholders.",
                        "Describe a situation where you identified and solved a problem proactively.",
                        "Tell me about a time when you had to manage a underperforming team member.",
                        "Give me an example of when you had to navigate office politics.",
                        "Describe how you handled a situation where you made a significant mistake.",
                        "Tell me about a time when you had to drive change in a resistant organization.",
                        "Give me an example of when you had to make a decision with incomplete information.",
                        "Describe a situation where you had to mentor or coach someone.",
                        "Tell me about the most challenging project you've managed."
                    ],
                    "expert": [
                        "Describe your approach to building and scaling high-performing engineering teams.",
                        "Tell me about a time when you had to make a strategic decision that affected the company's direction.",
                        "How have you handled situations where you had to balance technical debt with feature delivery?",
                        "Describe your experience driving organizational change across multiple teams.",
                        "Tell me about a time when you had to resolve a major conflict between departments.",
                        "How do you approach building engineering culture in a rapidly growing company?",
                        "Describe a situation where you had to make trade-offs between short-term and long-term goals.",
                        "Tell me about your experience with crisis management and incident response.",
                        "How have you balanced innovation with maintaining stable production systems?",
                        "Describe your approach to setting technical strategy and roadmaps.",
                        "Tell me about a time when you had to defend a technical decision to non-technical executives.",
                        "How do you approach talent development and succession planning?",
                        "Describe your experience managing distributed or remote teams.",
                        "Tell me about a time when you had to make a decision that was unpopular but necessary.",
                        "How do you approach vendor selection and build vs. buy decisions?"
                    ]
                }
            }
            
            # Save default bank
            QUESTION_BANK_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(QUESTION_BANK_FILE, 'w') as f:
                json.dump(question_bank, f, indent=2)
            logger.info("Created default question bank")
            
    except Exception as e:
        logger.error(f"Error loading question bank: {e}")
        question_bank = {}

def get_questions_from_bank(
    interview_type: str,
    difficulty: str,
    count: int
) -> List[str]:
    """Get random questions from the question bank"""
    import random
    
    category = interview_type if interview_type != "both" else "technical"
    questions = question_bank.get(category, {}).get(difficulty, [])
    
    if not questions:
        return []
    
    # Return random sample
    return random.sample(questions, min(count, len(questions)))

def generate_question_with_ai(
    interview_type: str,
    difficulty: str,
    resume_data: Dict = None,
    jd_data: Dict = None,
    api_key: str = None
) -> str:
    """Generate a custom question using Groq AI"""
    try:
        client = Groq(api_key=api_key)
        
        # Build context
        prompt = f"Generate ONE {difficulty} difficulty {interview_type} interview question."
        
        if resume_data:
            skills = resume_data.get('skills', [])
            experience = resume_data.get('experience', [])
            if skills:
                prompt += f"\n\nCandidate has these skills: {', '.join(skills[:5])}"
            if experience:
                recent_role = experience[0] if experience else {}
                prompt += f"\nMost recent role: {recent_role.get('role', '')} at {recent_role.get('company', '')}"
        
        if jd_data:
            required_skills = jd_data.get('requiredSkills', [])
            if required_skills:
                prompt += f"\n\nJob requires: {', '.join(required_skills[:5])}"
        
        prompt += "\n\nGenerate ONLY the question, nothing else. Make it specific and relevant."
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert interviewer. Generate clear, specific interview questions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.8
        )
        
        question = response.choices[0].message.content.strip()
        
        # Add to question bank for future use
        add_question_to_bank(interview_type, difficulty, question)
        
        return question
        
    except Exception as e:
        logger.error(f"Error generating AI question: {e}")
        # Fallback to bank
        questions = get_questions_from_bank(interview_type, difficulty, 1)
        return questions[0] if questions else "Tell me about your experience in this field."

def add_question_to_bank(interview_type: str, difficulty: str, question: str):
    """Add a new AI-generated question to the bank"""
    try:
        category = interview_type if interview_type != "both" else "technical"
        
        if category not in question_bank:
            question_bank[category] = {}
        if difficulty not in question_bank[category]:
            question_bank[category][difficulty] = []
        
        # Add if not already exists
        if question not in question_bank[category][difficulty]:
            question_bank[category][difficulty].append(question)
            
            # Save to file
            with open(QUESTION_BANK_FILE, 'w') as f:
                json.dump(question_bank, f, indent=2)
            
            logger.info(f"Added new question to bank: {category}/{difficulty}")
    except Exception as e:
        logger.error(f"Error adding question to bank: {e}")

def generate_interview_questions(
    interview_type: str,
    difficulty: str,
    count: int,
    resume_data: Dict = None,
    jd_data: Dict = None,
    api_key: str = None
) -> List[Dict[str, Any]]:
    """Generate a complete set of interview questions"""
    questions = []

    # Get questions from bank first
    bank_questions = get_questions_from_bank(interview_type, difficulty, count)

    for i, q_text in enumerate(bank_questions):
        questions.append({
            "questionId": f"q_{i+1}",
            "questionText": q_text,
            "category": interview_type,
            "difficulty": difficulty,
            "source": "bank"
        })

    # If we need more questions, generate with AI
    remaining = count - len(questions)
    if remaining > 0 and api_key:
        for i in range(remaining):
            q_text = generate_question_with_ai(
                interview_type,
                difficulty,
                resume_data,
                jd_data,
                api_key
            )
            questions.append({
                "questionId": f"q_{len(questions)+1}",
                "questionText": q_text,
                "category": interview_type,
                "difficulty": difficulty,
                "source": "ai_generated"
            })

    return questions

class QuestionGenerator:
    """Question generator service class"""

    def __init__(self):
        # Initialize if needed
        pass

    def generate_questions(
        self,
        interview_type: str,
        difficulty: str,
        count: int,
        resume_data: Dict = None,
        jd_data: Dict = None,
        api_key: str = None
    ) -> List[Dict[str, Any]]:
        """Generate interview questions"""
        return generate_interview_questions(
            interview_type, difficulty, count, resume_data, jd_data, api_key
        )
