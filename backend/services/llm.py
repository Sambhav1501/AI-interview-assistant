# backend/services/llm.py
from groq import Groq
from typing import List, Dict, Any, Tuple
from serpapi import GoogleSearch
import logging
import asyncio
import json

logger = logging.getLogger(__name__)

class LLMService:
    """Language Learning Model service using Groq API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = Groq(api_key=api_key)

    async def evaluate_answer(self, answer: str, question: str) -> str:
        """Evaluate a user's answer to an interview question"""
        try:
            prompt = f"""
            Evaluate this interview answer on a scale of 1-10 for:
            1. Technical accuracy and relevance
            2. Clarity and communication skills
            3. Completeness and depth

            Question: {question}
            Answer: {answer}

            Provide a brief evaluation (2-3 sentences) and a score out of 10.
            """

            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are an expert interviewer evaluating candidate responses."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=150,
                    temperature=0.3
                )
            )

            evaluation = response.choices[0].message.content.strip()
            logger.info(f"Answer evaluation: {evaluation[:100]}...")
            return evaluation

        except Exception as e:
            logger.error(f"LLM evaluation error: {e}")
            return "Unable to evaluate answer at this time."

system_instructions = """
You are an AI interviewer conducting a professional interview. 

Your role:
- Ask thoughtful, relevant questions based on the candidate's background
- Listen carefully to their responses
- Ask follow-up questions when appropriate (max 2 per question)
- Provide a supportive but professional tone
- Keep responses concise and clear (under 100 words)
- Evaluate answers for technical accuracy, clarity, and completeness

Current interview context will be provided. Stay in character as an interviewer.
"""

def should_search_web(user_query: str, api_key: str) -> bool:
    """Determine if web search is needed"""
    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": f"Does this require current web info? Answer only yes/no: {user_query}"}
            ],
            max_tokens=10,
            temperature=0
        )
        return response.choices[0].message.content.strip().lower() == "yes"
    except Exception as e:
        logger.error(f"Error in should_search_web: {e}")
        return False

def get_llm_response(user_query: str, history: List[Dict[str, Any]], api_key: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Get response from Groq LLM"""
    try:
        client = Groq(api_key=api_key)
        
        # Build messages
        messages = [{"role": "system", "content": system_instructions}]
        
        # Add history
        for msg in history:
            role = msg.get('role', 'user')
            if role == 'model':
                role = 'assistant'
            content = msg.get('parts', [{'text': ''}])[0].get('text', '')
            if content:
                messages.append({"role": role, "content": content})
        
        # Add current query
        messages.append({"role": "user", "content": user_query})
        
        # Get response
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )
        
        assistant_response = response.choices[0].message.content
        
        # Update history
        new_history = history.copy()
        new_history.append({'role': 'user', 'parts': [{'text': user_query}]})
        new_history.append({'role': 'model', 'parts': [{'text': assistant_response}]})
        
        return assistant_response, new_history
        
    except Exception as e:
        logger.error(f"Error getting LLM response: {e}")
        return "I apologize, but I'm having trouble processing that. Could you please repeat?", history

def get_web_response(user_query: str, history: List[Dict[str, Any]], groq_api_key: str, serp_api_key: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Get response after web search"""
    try:
        params = {
            "q": user_query,
            "api_key": serp_api_key,
            "engine": "google",
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        
        if "organic_results" in results:
            search_context = "\n".join([
                result.get("snippet", "") 
                for result in results["organic_results"][:5]
            ])
            prompt_with_context = f"Based on these search results, answer: '{user_query}'\n\nResults:\n{search_context}"
            return get_llm_response(prompt_with_context, history, groq_api_key)
        else:
            return "I couldn't find relevant information.", history
            
    except Exception as e:
        logger.error(f"Error getting web response: {e}")
        return "I encountered an error searching for that information.", history

def generate_interview_question(
    interview_type: str,
    difficulty: str,
    resume_data: dict = None,
    jd_data: dict = None,
    api_key: str = None
) -> str:
    """Generate interview question based on context"""
    try:
        client = Groq(api_key=api_key)
        
        # Build context
        context = f"Generate a {difficulty} difficulty {interview_type} interview question."
        
        if resume_data:
            context += f"\n\nCandidate background: {resume_data.get('summary', '')}"
            context += f"\nSkills: {', '.join(resume_data.get('skills', []))}"
        
        if jd_data:
            context += f"\n\nJob requirements: {jd_data.get('description', '')}"
            context += f"\nRequired skills: {', '.join(jd_data.get('required_skills', []))}"
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert interviewer. Generate one clear, specific interview question."},
                {"role": "user", "content": context}
            ],
            max_tokens=150,
            temperature=0.8
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Error generating question: {e}")
        return "Tell me about your experience and what interests you about this role."
    
    