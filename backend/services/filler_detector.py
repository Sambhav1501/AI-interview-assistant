# backend/services/filler_detector.py
import re
from typing import Dict

def detect_filler_words(transcript: str) -> Dict[str, int]:
    """Detect filler words in transcript"""
    
    # Normalize text
    text = transcript.lower()
    
    # Count filler words
    fillers = {
        "um": len(re.findall(r'\bum\b', text)),
        "uh": len(re.findall(r'\buh\b', text)),
        "like": len(re.findall(r'\blike\b', text)),
        "youKnow": len(re.findall(r'\byou know\b', text)),
    }
    
    fillers["total"] = sum(fillers.values())
    
    return fillers

def calculate_words_per_minute(transcript: str, duration_seconds: float) -> float:
    """Calculate speaking rate"""
    if duration_seconds == 0:
        return 0
    
    word_count = len(transcript.split())
    wpm = (word_count / duration_seconds) * 60
    
    return round(wpm, 1)