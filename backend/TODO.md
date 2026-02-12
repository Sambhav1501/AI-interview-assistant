# Voice Integration Fixes for AI Interview Assistant

## Issues Identified:
1. WebSocket routing mismatch - frontend connects to `/ws/interview` but backend routing is inconsistent
2. Wrong WebSocket logic - backend using voice assistant code instead of interview logic
3. TTS streaming issues - audio not properly streaming to frontend
4. STT integration - transcription not triggering proper interview flow

## Tasks:
- [ ] Update main.py to include proper WebSocket routing for `/ws/interview`
- [ ] Fix websocket.py to use interview logic instead of voice assistant code
- [ ] Update TTS service to properly stream audio chunks
- [ ] Ensure STT properly integrates with interview question flow
- [ ] Test the complete voice interview flow

## Files to modify:
- backend/main.py - WebSocket routing ✅
- backend/api/websocket.py - Interview WebSocket logic ✅
- backend/services/tts.py - Audio streaming ✅
- backend/services/stt.py - Speech transcription ✅
- backend/services/llm.py - Interview response generation ✅
