# # # # backend/api/websocket.py
# # # from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# # # import logging
# # # import json
# # # import asyncio
# # # import base64
# # # import re

# # # # Import services
# # # from services import stt, llm, tts, question_generator

# # # router = APIRouter()
# # # logger = logging.getLogger(__name__)

# # # MOCK_QUESTIONS = [
# # #     "Tell me about yourself and your background.",
# # #     "What interests you about this role?",
# # #     "Describe a challenging project you worked on.",
# # #     "What are your greatest strengths?",
# # #     "Where do you see yourself in 5 years?"
# # # ]

# # # @router.websocket("/interview")
# # # async def interview_websocket(websocket: WebSocket):
# # #     """WebSocket endpoint for real-time interview sessions with voice"""
# # #     await websocket.accept()
# # #     logger.info("✅ Interview WebSocket connected")

# # #     api_keys = {}
# # #     chat_history = []
# # #     question_count = 0
# # #     current_question = ""

# # #     loop = asyncio.get_event_loop()
# # #     disconnected = False  # track whether the client has disconnected

# # #     async def handle_transcript(text: str):
# # #         """Process final transcript and generate AI response"""
# # #         # Allow reassignment of outer scope variables
# # #         nonlocal question_count, current_question, disconnected

# # #         logger.info(f"🎤 User said: {text}")

# # #         # If client already disconnected, bail out early
# # #         if disconnected:
# # #             logger.warning("handle_transcript called after disconnect — ignoring.")
# # #             return

# # #         # Send final transcript to frontend
# # #         await websocket.send_json({
# # #             "type": "transcript_final",
# # #             "text": text
# # #         })

# # #         try:
# # #             # Generate AI response using interview context
# # #             if llm.should_search_web(text, api_keys.get("groq")):
# # #                 ai_response, updated_history = llm.get_web_response(text, chat_history, api_keys.get("groq"), api_keys.get("serpapi"))
# # #             else:
# # #                 ai_response, updated_history = llm.get_llm_response(text, chat_history, api_keys.get("groq"))

# # #             chat_history.clear()
# # #             chat_history.extend(updated_history)

# # #             # Send AI text response
# # #             await websocket.send_json({
# # #                 "type": "ai_response",
# # #                 "text": ai_response
# # #             })

# # #             # Generate and stream audio sentence by sentence
# # #             sentences = re.split(r'(?<=[.?!])\s+', ai_response.strip())
# # #             for sentence in sentences:
# # #                 if disconnected:
# # #                     logger.info("Client disconnected mid-response — stopping TTS.")
# # #                     return
# # #                 if sentence.strip():
# # #                     audio_bytes = await loop.run_in_executor(
# # #                         None, tts.speak, sentence.strip(), api_keys.get("murf")
# # #                     )
# # #                     if audio_bytes:
# # #                         b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
# # #                         await websocket.send_json({
# # #                             "type": "ai_audio",
# # #                             "audio": b64_audio
# # #                         })

# # #             # Check whether the LLM response already ends with a question.
# # #             # If it does, that IS the follow-up — don't override it with the next MOCK_QUESTION.
# # #             # Only advance to the next scripted question when the LLM response was purely informational.
# # #             ai_ends_with_question = ai_response.strip().endswith("?")

# # #             if ai_ends_with_question:
# # #                 # LLM already asked a contextual follow-up; let the user answer that.
# # #                 logger.info("🤖 LLM response is a follow-up question — skipping MOCK_QUESTIONS advance.")
# # #             elif question_count + 1 < len(MOCK_QUESTIONS):
# # #                 # LLM response was not a question — move to next scripted question
# # #                 await asyncio.sleep(2)
# # #                 question_count += 1
# # #                 next_question = MOCK_QUESTIONS[question_count]
# # #                 current_question = next_question

# # #                 await websocket.send_json({
# # #                     "type": "ai_response",
# # #                     "text": next_question
# # #                 })

# # #                 # Generate audio for next question
# # #                 question_audio = await loop.run_in_executor(
# # #                     None, tts.speak, next_question, api_keys.get("murf")
# # #                 )
# # #                 if question_audio:
# # #                     b64_question_audio = base64.b64encode(question_audio).decode('utf-8')
# # #                     await websocket.send_json({
# # #                         "type": "ai_audio",
# # #                         "audio": b64_question_audio
# # #                     })

# # #                 logger.info(f"📢 AI asking: {next_question}")
# # #             else:
# # #                 # Interview complete
# # #                 completion_msg = "Thank you! That completes our interview today. Great job!"
# # #                 await websocket.send_json({
# # #                     "type": "ai_response",
# # #                     "text": completion_msg
# # #                 })

# # #                 completion_audio = await loop.run_in_executor(
# # #                     None, tts.speak, completion_msg, api_keys.get("murf")
# # #                 )
# # #                 if completion_audio:
# # #                     b64_completion_audio = base64.b64encode(completion_audio).decode('utf-8')
# # #                     await websocket.send_json({
# # #                         "type": "ai_audio",
# # #                         "audio": b64_completion_audio
# # #                     })

# # #                 logger.info("🎉 Interview completed!")

# # #         except Exception as e:
# # #             logger.error(f"❌ Error in interview pipeline: {e}", exc_info=True)
# # #             if not disconnected:
# # #                 try:
# # #                     await websocket.send_json({
# # #                         "type": "error",
# # #                         "message": "Sorry, I encountered an error processing your response."
# # #                     })
# # #                 except Exception:
# # #                     pass  # socket already gone, nothing to do

# # #     def on_final_transcript(text: str):
# # #         """Handle final transcript from STT"""
# # #         asyncio.run_coroutine_threadsafe(handle_transcript(text), loop)

# # #     def on_partial_transcript(text: str):
# # #         """Handle partial transcript from STT"""
# # #         asyncio.run_coroutine_threadsafe(
# # #             websocket.send_json({
# # #                 "type": "transcript_partial",
# # #                 "text": text
# # #             }),
# # #             loop
# # #         )

# # #     try:
# # #         # Receive config with API keys
# # #         config_data = await websocket.receive_text()
# # #         config = json.loads(config_data)

# # #         if config.get("type") == "config":
# # #             api_keys = config.get("keys", {})
# # #             logger.info(f"✅ API keys received: {list(api_keys.keys())}")

# # #             # Send first question
# # #             first_question = MOCK_QUESTIONS[0]
# # #             current_question = first_question

# # #             await websocket.send_json({
# # #                 "type": "ai_response",
# # #                 "text": first_question
# # #             })

# # #             # Generate audio for first question
# # #             first_audio = await loop.run_in_executor(
# # #                 None, tts.speak, first_question, api_keys.get("murf")
# # #             )
# # #             if first_audio:
# # #                 b64_first_audio = base64.b64encode(first_audio).decode('utf-8')
# # #                 await websocket.send_json({
# # #                     "type": "ai_audio",
# # #                     "audio": b64_first_audio
# # #                 })

# # #             logger.info(f"📢 AI asking: {first_question}")

# # #         # Initialize STT transcriber
# # #         transcriber = stt.AssemblyAIStreamingTranscriber(
# # #             on_partial_callback=on_partial_transcript,
# # #             on_final_callback=on_final_transcript,
# # #             api_key=api_keys.get("assemblyai")
# # #         )

# # #         # Handle audio stream
# # #         while True:
# # #             try:
# # #                 data = await asyncio.wait_for(websocket.receive(), timeout=30.0)

# # #                 # Starlette puts a disconnect event in the dict with type == "websocket.disconnect"
# # #                 if data.get("type") == "websocket.disconnect":
# # #                     logger.info("👋 Client sent disconnect frame.")
# # #                     disconnected = True
# # #                     break

# # #                 if "bytes" in data:
# # #                     audio_chunk = data["bytes"]
# # #                     transcriber.stream_audio(audio_chunk)

# # #                 elif "text" in data:
# # #                     msg = json.loads(data["text"])
# # #                     logger.info(f"Received message: {msg.get('type', 'unknown')}")

# # #             except asyncio.TimeoutError:
# # #                 # Keep connection alive on idle
# # #                 continue

# # #     except WebSocketDisconnect:
# # #         logger.info("👋 Interview WebSocket disconnected")
# # #         disconnected = True
# # #     except RuntimeError as e:
# # #         # "Cannot call receive once a disconnect message has been received"
# # #         if "disconnect" in str(e).lower():
# # #             logger.info("👋 WebSocket already disconnected — exiting cleanly.")
# # #             disconnected = True
# # #         else:
# # #             logger.error(f"❌ WebSocket RuntimeError: {e}", exc_info=True)
# # #     except Exception as e:
# # #         logger.error(f"❌ WebSocket error: {e}", exc_info=True)
# # #         if not disconnected:
# # #             try:
# # #                 await websocket.send_json({
# # #                     "type": "error",
# # #                     "message": "An error occurred. Please try again."
# # #                 })
# # #             except Exception:
# # #                 pass
# # #     finally:
# # #         disconnected = True
# # #         if 'transcriber' in locals() and transcriber:
# # #             transcriber.close()
# # #         logger.info("🧹 WebSocket cleanup complete")


# # ######################################################################################################

# # # backend/api/websocket.py
# # from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# # import logging
# # import json
# # import asyncio
# # import base64
# # import re
# # import httpx

# # # Import services
# # from services import stt, llm, tts, question_generator

# # router = APIRouter()
# # logger = logging.getLogger(__name__)

# # # ---------------------------------------------------------------------------
# # # Configuration
# # # ---------------------------------------------------------------------------
# # MOCK_QUESTIONS = [
# #     "Tell me about yourself and your background.",
# #     "What interests you about this role?",
# #     "Describe a challenging project you worked on.",
# #     "What are your greatest strengths?",
# #     "Where do you see yourself in 5 years?"
# # ]

# # # How many of the MOCK_QUESTIONS must be answered before the interview auto-ends.
# # # The LLM follow-ups in between don't count — only advances through MOCK_QUESTIONS count.
# # MAX_QUESTIONS_ANSWERED = 5

# # # Phrases that, if the user says them, trigger an early end to the interview.
# # END_TRIGGERS = [
# #     "end interview",
# #     "end the interview",
# #     "can we end",
# #     "let's end",
# #     "lets end",
# #     "stop interview",
# #     "stop the interview",
# #     "i want to end",
# #     "i'd like to end",
# #     "that's all",
# #     "thats all",
# #     "we can stop",
# #     "we can end",
# #     "finish the interview",
# #     "finish interview",
# # ]


# # # ---------------------------------------------------------------------------
# # # Helpers
# # # ---------------------------------------------------------------------------
# # def is_end_request(text: str) -> bool:
# #     """Return True if the user's transcript is asking to end the interview."""
# #     normalized = text.strip().lower()
# #     return any(trigger in normalized for trigger in END_TRIGGERS)


# # async def generate_feedback_report(chat_history: list, api_key: str) -> str:
# #     """
# #     Call Groq to produce a structured feedback report based on the full
# #     chat history of the interview.  Returns a plain-text report string.
# #     """
# #     # Build a compact summary of Q&A pairs for the prompt
# #     qa_summary = []
# #     for msg in chat_history:
# #         role = msg.get("role", "")
# #         content = msg.get("content", "")
# #         if role == "user":
# #             qa_summary.append(f"Candidate: {content}")
# #         elif role == "assistant":
# #             qa_summary.append(f"Interviewer: {content}")
# #     transcript_text = "\n".join(qa_summary)

# #     prompt = (
# #         "You are an expert interview coach. Based on the mock interview transcript below, "
# #         "generate a detailed feedback report for the candidate.\n\n"
# #         "The report must include exactly these sections:\n\n"
# #         "1. OVERALL SCORE (out of 10)\n"
# #         "2. STRENGTHS – what the candidate did well\n"
# #         "3. AREAS FOR IMPROVEMENT – specific weaknesses or gaps observed\n"
# #         "4. COMMUNICATION SKILLS – clarity, confidence, structure of answers\n"
# #         "5. TECHNICAL KNOWLEDGE – depth and accuracy of technical responses\n"
# #         "6. RECOMMENDATIONS – 3-5 actionable tips for the candidate\n\n"
# #         "Be honest, constructive, and specific. Reference actual things the candidate said.\n\n"
# #         "--- INTERVIEW TRANSCRIPT ---\n"
# #         f"{transcript_text}\n"
# #         "--- END TRANSCRIPT ---\n"
# #     )

# #     try:
# #         async with httpx.AsyncClient() as client:
# #             response = await client.post(
# #                 "https://api.groq.com/openai/v1/chat/completions",
# #                 headers={
# #                     "Authorization": f"Bearer {api_key}",
# #                     "Content-Type": "application/json",
# #                 },
# #                 json={
# #                     "model": "llama-3.3-70b-versatile",
# #                     "messages": [{"role": "user", "content": prompt}],
# #                     "max_tokens": 1500,
# #                     "temperature": 0.4,
# #                 },
# #                 timeout=30.0,
# #             )
# #             data = response.json()
# #             return data["choices"][0]["message"]["content"]
# #     except Exception as e:
# #         logger.error(f"❌ Feedback report generation failed: {e}", exc_info=True)
# #         return (
# #             "Sorry, the feedback report could not be generated at this time. "
# #             "Please review your interview manually."
# #         )


# # async def end_interview(websocket: WebSocket, chat_history: list, api_keys: dict, loop):
# #     """
# #     Shared routine: say goodbye via TTS, generate the feedback report,
# #     and push it to the frontend as an 'interview_report' message.
# #     """
# #     goodbye_msg = (
# #         "Thank you for completing the interview! "
# #         "I'm now generating your feedback report. Please wait a moment."
# #     )

# #     # Send goodbye text + audio
# #     await websocket.send_json({"type": "ai_response", "text": goodbye_msg})
# #     goodbye_audio = await loop.run_in_executor(
# #         None, tts.speak, goodbye_msg, api_keys.get("murf")
# #     )
# #     if goodbye_audio:
# #         await websocket.send_json({
# #             "type": "ai_audio",
# #             "audio": base64.b64encode(goodbye_audio).decode("utf-8"),
# #         })

# #     logger.info("📝 Generating feedback report…")

# #     # Generate report (async, calls Groq)
# #     report = await generate_feedback_report(chat_history, api_keys.get("groq"))

# #     # Push the report to the frontend
# #     await websocket.send_json({
# #         "type": "interview_report",
# #         "report": report,
# #     })

# #     logger.info("✅ Feedback report sent to client.")


# # # ---------------------------------------------------------------------------
# # # WebSocket handler
# # # ---------------------------------------------------------------------------
# # @router.websocket("/interview")
# # async def interview_websocket(websocket: WebSocket):
# #     """WebSocket endpoint for real-time interview sessions with voice"""
# #     await websocket.accept()
# #     logger.info("✅ Interview WebSocket connected")

# #     api_keys = {}
# #     chat_history = []
# #     question_count = 0
# #     current_question = ""
# #     interview_ended = False  # set once end_interview() has run — prevents double-fire

# #     loop = asyncio.get_event_loop()
# #     disconnected = False

# #     async def handle_transcript(text: str):
# #         nonlocal question_count, current_question, disconnected, interview_ended

# #         logger.info(f"🎤 User said: {text}")

# #         if disconnected or interview_ended:
# #             logger.warning("handle_transcript called after disconnect/end — ignoring.")
# #             return

# #         # --- Check for early-end voice command ---
# #         if is_end_request(text):
# #             logger.info("🛑 User requested early end of interview.")
# #             await websocket.send_json({"type": "transcript_final", "text": text})
# #             interview_ended = True
# #             await end_interview(websocket, chat_history, api_keys, loop)
# #             return

# #         # Send final transcript to frontend
# #         await websocket.send_json({"type": "transcript_final", "text": text})

# #         try:
# #             # --- LLM response ---
# #             if llm.should_search_web(text, api_keys.get("groq")):
# #                 ai_response, updated_history = llm.get_web_response(
# #                     text, chat_history, api_keys.get("groq"), api_keys.get("serpapi")
# #                 )
# #             else:
# #                 ai_response, updated_history = llm.get_llm_response(
# #                     text, chat_history, api_keys.get("groq")
# #                 )

# #             chat_history.clear()
# #             chat_history.extend(updated_history)

# #             # Send AI text response
# #             await websocket.send_json({"type": "ai_response", "text": ai_response})

# #             # --- TTS: stream audio sentence by sentence ---
# #             sentences = re.split(r'(?<=[.?!])\s+', ai_response.strip())
# #             for sentence in sentences:
# #                 if disconnected or interview_ended:
# #                     return
# #                 if sentence.strip():
# #                     audio_bytes = await loop.run_in_executor(
# #                         None, tts.speak, sentence.strip(), api_keys.get("murf")
# #                     )
# #                     if audio_bytes:
# #                         await websocket.send_json({
# #                             "type": "ai_audio",
# #                             "audio": base64.b64encode(audio_bytes).decode("utf-8"),
# #                         })

# #             # --- Decide: follow-up already asked? advance? or end? ---
# #             ai_ends_with_question = ai_response.strip().endswith("?")

# #             if ai_ends_with_question:
# #                 # LLM asked a contextual follow-up — stay on current MOCK_QUESTION
# #                 logger.info("🤖 LLM follow-up question — not advancing MOCK_QUESTIONS.")

# #             elif question_count + 1 < len(MOCK_QUESTIONS):
# #                 # Advance to next scripted question
# #                 await asyncio.sleep(2)
# #                 question_count += 1

# #                 # ---- Check if we've hit the max questions answered ----
# #                 if question_count >= MAX_QUESTIONS_ANSWERED:
# #                     logger.info(f"🏁 Max questions reached ({MAX_QUESTIONS_ANSWERED}).")
# #                     interview_ended = True
# #                     await end_interview(websocket, chat_history, api_keys, loop)
# #                     return

# #                 next_question = MOCK_QUESTIONS[question_count]
# #                 current_question = next_question

# #                 await websocket.send_json({"type": "ai_response", "text": next_question})

# #                 question_audio = await loop.run_in_executor(
# #                     None, tts.speak, next_question, api_keys.get("murf")
# #                 )
# #                 if question_audio:
# #                     await websocket.send_json({
# #                         "type": "ai_audio",
# #                         "audio": base64.b64encode(question_audio).decode("utf-8"),
# #                     })

# #                 logger.info(f"📢 AI asking: {next_question}")

# #             else:
# #                 # All MOCK_QUESTIONS exhausted — end interview
# #                 logger.info("🏁 All questions answered — ending interview.")
# #                 interview_ended = True
# #                 await end_interview(websocket, chat_history, api_keys, loop)

# #         except Exception as e:
# #             logger.error(f"❌ Error in interview pipeline: {e}", exc_info=True)
# #             if not disconnected:
# #                 try:
# #                     await websocket.send_json({
# #                         "type": "error",
# #                         "message": "Sorry, I encountered an error processing your response.",
# #                     })
# #                 except Exception:
# #                     pass

# #     def on_final_transcript(text: str):
# #         asyncio.run_coroutine_threadsafe(handle_transcript(text), loop)

# #     def on_partial_transcript(text: str):
# #         asyncio.run_coroutine_threadsafe(
# #             websocket.send_json({"type": "transcript_partial", "text": text}),
# #             loop,
# #         )

# #     try:
# #         # Receive config with API keys
# #         config_data = await websocket.receive_text()
# #         config = json.loads(config_data)

# #         if config.get("type") == "config":
# #             api_keys = config.get("keys", {})
# #             logger.info(f"✅ API keys received: {list(api_keys.keys())}")

# #             # Send first question
# #             first_question = MOCK_QUESTIONS[0]
# #             current_question = first_question

# #             await websocket.send_json({"type": "ai_response", "text": first_question})

# #             first_audio = await loop.run_in_executor(
# #                 None, tts.speak, first_question, api_keys.get("murf")
# #             )
# #             if first_audio:
# #                 await websocket.send_json({
# #                     "type": "ai_audio",
# #                     "audio": base64.b64encode(first_audio).decode("utf-8"),
# #                 })

# #             logger.info(f"📢 AI asking: {first_question}")

# #         # Initialize STT transcriber
# #         transcriber = stt.AssemblyAIStreamingTranscriber(
# #             on_partial_callback=on_partial_transcript,
# #             on_final_callback=on_final_transcript,
# #             api_key=api_keys.get("assemblyai"),
# #         )

# #         # Main receive loop
# #         while True:
# #             try:
# #                 data = await asyncio.wait_for(websocket.receive(), timeout=30.0)

# #                 if data.get("type") == "websocket.disconnect":
# #                     logger.info("👋 Client sent disconnect frame.")
# #                     disconnected = True
# #                     break

# #                 if "bytes" in data:
# #                     transcriber.stream_audio(data["bytes"])
# #                 elif "text" in data:
# #                     msg = json.loads(data["text"])
# #                     logger.info(f"Received message: {msg.get('type', 'unknown')}")

# #             except asyncio.TimeoutError:
# #                 continue

# #     except WebSocketDisconnect:
# #         logger.info("👋 Interview WebSocket disconnected")
# #         disconnected = True
# #     except RuntimeError as e:
# #         if "disconnect" in str(e).lower():
# #             logger.info("👋 WebSocket already disconnected — exiting cleanly.")
# #             disconnected = True
# #         else:
# #             logger.error(f"❌ WebSocket RuntimeError: {e}", exc_info=True)
# #     except Exception as e:
# #         logger.error(f"❌ WebSocket error: {e}", exc_info=True)
# #         if not disconnected:
# #             try:
# #                 await websocket.send_json({
# #                     "type": "error",
# #                     "message": "An error occurred. Please try again.",
# #                 })
# #             except Exception:
# #                 pass
# #     finally:
# #         disconnected = True
# #         if 'transcriber' in locals() and transcriber:
# #             transcriber.close()
# #         logger.info("🧹 WebSocket cleanup complete")


# ###############################################################################################


# backend/api/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
import json
import asyncio
import base64
import re
import httpx

# Import services
from services import stt, llm, tts, question_generator

router = APIRouter()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MOCK_QUESTIONS = [
    "Tell me about yourself and your background.",
    "What interests you about this role?",
    "Describe a challenging project you worked on.",
    "What are your greatest strengths?",
    "Where do you see yourself in 5 years?"
]

# How many of the MOCK_QUESTIONS must be answered before the interview auto-ends.
MAX_QUESTIONS_ANSWERED = 5

# Phrases that trigger an early end.
END_TRIGGERS = [
    "end interview",
    "end the interview",
    "can we end",
    "let's end",
    "lets end",
    "stop interview",
    "stop the interview",
    "i want to end",
    "i'd like to end",
    "that's all",
    "thats all",
    "we can stop",
    "we can end",
    "finish the interview",
    "finish interview",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def is_end_request(text: str) -> bool:
    """Return True if the user's transcript is asking to end the interview."""
    normalized = text.strip().lower()
    return any(trigger in normalized for trigger in END_TRIGGERS)


async def generate_feedback_report(interview_log: list, api_key: str) -> str:
    """
    Call Groq to produce a structured feedback report.
    interview_log is the dedicated list of {"question": ..., "answer": ...} dicts
    recorded during the session — this is what gets turned into the transcript
    the LLM grades.
    """
    # Build a clearly labelled transcript from the log
    transcript_lines = []
    for i, entry in enumerate(interview_log, start=1):
        transcript_lines.append(f"Q{i}: {entry['question']}")
        transcript_lines.append(f"A{i}: {entry['answer']}")
        transcript_lines.append("")  # blank line between pairs for readability
    transcript_text = "\n".join(transcript_lines)

    prompt = (
        "You are an expert interview coach. Based on the mock interview transcript below, "
        "generate a detailed feedback report for the candidate.\n\n"
        "The report must include exactly these sections:\n\n"
        "1. OVERALL SCORE (out of 10)\n"
        "2. STRENGTHS – what the candidate did well\n"
        "3. AREAS FOR IMPROVEMENT – specific weaknesses or gaps observed\n"
        "4. COMMUNICATION SKILLS – clarity, confidence, structure of answers\n"
        "5. TECHNICAL KNOWLEDGE – depth and accuracy of technical responses\n"
        "6. RECOMMENDATIONS – 3-5 actionable tips for the candidate\n\n"
        "Be honest, constructive, and specific. Reference actual things the candidate said.\n\n"
        "--- INTERVIEW TRANSCRIPT ---\n"
        f"{transcript_text}\n"
        "--- END TRANSCRIPT ---\n"
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1500,
                    "temperature": 0.4,
                },
                timeout=30.0,
            )
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"❌ Feedback report generation failed: {e}", exc_info=True)
        return (
            "Sorry, the feedback report could not be generated at this time. "
            "Please review your interview manually."
        )


async def end_interview(websocket: WebSocket, interview_log: list, api_keys: dict, loop):
    """
    Shared routine: say goodbye via TTS, generate the feedback report from
    interview_log, and push it to the frontend.
    """
    goodbye_msg = (
        "Thank you for completing the interview! "
        "I'm now generating your feedback report. Please wait a moment."
    )

    await websocket.send_json({"type": "ai_response", "text": goodbye_msg})
    goodbye_audio = await loop.run_in_executor(
        None, tts.speak, goodbye_msg, api_keys.get("murf")
    )
    if goodbye_audio:
        await websocket.send_json({
            "type": "ai_audio",
            "audio": base64.b64encode(goodbye_audio).decode("utf-8"),
        })

    logger.info(f"📝 Generating feedback report… ({len(interview_log)} Q&A pairs logged)")
    logger.info(f"📋 Interview log:\n{json.dumps(interview_log, indent=2)}")

    report = await generate_feedback_report(interview_log, api_keys.get("groq"))

    # Send report + the raw log so the frontend can also render the full transcript
    await websocket.send_json({
        "type": "interview_report",
        "report": report,
        "transcript": interview_log,   # the frontend can display this too
    })

    logger.info("✅ Feedback report sent to client.")


# ---------------------------------------------------------------------------
# WebSocket handler
# ---------------------------------------------------------------------------
@router.websocket("/interview")
async def interview_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time interview sessions with voice"""
    await websocket.accept()
    logger.info("✅ Interview WebSocket connected")

    api_keys = {}
    chat_history = []          # LLM rolling context (cleared/rebuilt each turn by llm.py)
    interview_log = []         # ← OUR dedicated Q&A record: [{"question": ..., "answer": ...}, ...]
    question_count = 0
    current_question = ""      # the question currently "on the table" waiting for an answer
    interview_ended = False

    loop = asyncio.get_event_loop()
    disconnected = False

    async def handle_transcript(text: str):
        nonlocal question_count, current_question, disconnected, interview_ended

        logger.info(f"🎤 User said: {text}")

        if disconnected or interview_ended:
            logger.warning("handle_transcript called after disconnect/end — ignoring.")
            return

        # --- Check for early-end voice command ---
        if is_end_request(text):
            logger.info("🛑 User requested early end of interview.")
            await websocket.send_json({"type": "transcript_final", "text": text})
            interview_ended = True
            await end_interview(websocket, interview_log, api_keys, loop)
            return

        # ---------------------------------------------------------------
        # Record this answer against whatever question is currently active.
        # This captures BOTH scripted MOCK_QUESTIONS and LLM follow-ups,
        # because current_question is updated whenever either one is asked.
        # ---------------------------------------------------------------
        if current_question:
            interview_log.append({
                "question": current_question,
                "answer": text
            })
            logger.info(f"📝 Logged Q&A pair #{len(interview_log)}")

        # Send final transcript to frontend
        await websocket.send_json({"type": "transcript_final", "text": text})

        try:
            # --- LLM response ---
            if llm.should_search_web(text, api_keys.get("groq")):
                ai_response, updated_history = llm.get_web_response(
                    text, chat_history, api_keys.get("groq"), api_keys.get("serpapi")
                )
            else:
                ai_response, updated_history = llm.get_llm_response(
                    text, chat_history, api_keys.get("groq")
                )

            chat_history.clear()
            chat_history.extend(updated_history)

            # Send AI text response
            await websocket.send_json({"type": "ai_response", "text": ai_response})

            # --- TTS: stream audio sentence by sentence ---
            sentences = re.split(r'(?<=[.?!])\s+', ai_response.strip())
            for sentence in sentences:
                if disconnected or interview_ended:
                    return
                if sentence.strip():
                    audio_bytes = await loop.run_in_executor(
                        None, tts.speak, sentence.strip(), api_keys.get("murf")
                    )
                    if audio_bytes:
                        await websocket.send_json({
                            "type": "ai_audio",
                            "audio": base64.b64encode(audio_bytes).decode("utf-8"),
                        })

            # --- Decide: follow-up already asked? advance? or end? ---
            ai_ends_with_question = ai_response.strip().endswith("?")

            if ai_ends_with_question:
                # LLM asked a contextual follow-up.
                # Update current_question so the NEXT transcript gets logged against it.
                current_question = ai_response.strip()
                logger.info("🤖 LLM follow-up question — not advancing MOCK_QUESTIONS.")

            elif question_count + 1 < len(MOCK_QUESTIONS):
                # Advance to next scripted question
                await asyncio.sleep(2)
                question_count += 1

                if question_count >= MAX_QUESTIONS_ANSWERED:
                    logger.info(f"🏁 Max questions reached ({MAX_QUESTIONS_ANSWERED}).")
                    interview_ended = True
                    await end_interview(websocket, interview_log, api_keys, loop)
                    return

                next_question = MOCK_QUESTIONS[question_count]
                current_question = next_question   # update so next answer logs against this

                await websocket.send_json({"type": "ai_response", "text": next_question})

                question_audio = await loop.run_in_executor(
                    None, tts.speak, next_question, api_keys.get("murf")
                )
                if question_audio:
                    await websocket.send_json({
                        "type": "ai_audio",
                        "audio": base64.b64encode(question_audio).decode("utf-8"),
                    })

                logger.info(f"📢 AI asking: {next_question}")

            else:
                # All MOCK_QUESTIONS exhausted
                logger.info("🏁 All questions answered — ending interview.")
                interview_ended = True
                await end_interview(websocket, interview_log, api_keys, loop)

        except Exception as e:
            logger.error(f"❌ Error in interview pipeline: {e}", exc_info=True)
            if not disconnected:
                try:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Sorry, I encountered an error processing your response.",
                    })
                except Exception:
                    pass

    def on_final_transcript(text: str):
        asyncio.run_coroutine_threadsafe(handle_transcript(text), loop)

    def on_partial_transcript(text: str):
        asyncio.run_coroutine_threadsafe(
            websocket.send_json({"type": "transcript_partial", "text": text}),
            loop,
        )

    try:
        config_data = await websocket.receive_text()
        config = json.loads(config_data)

        if config.get("type") == "config":
            api_keys = config.get("keys", {})
            logger.info(f"✅ API keys received: {list(api_keys.keys())}")

            # Send first question
            first_question = MOCK_QUESTIONS[0]
            current_question = first_question

            await websocket.send_json({"type": "ai_response", "text": first_question})

            first_audio = await loop.run_in_executor(
                None, tts.speak, first_question, api_keys.get("murf")
            )
            if first_audio:
                await websocket.send_json({
                    "type": "ai_audio",
                    "audio": base64.b64encode(first_audio).decode("utf-8"),
                })

            logger.info(f"📢 AI asking: {first_question}")

        # Initialize STT transcriber
        transcriber = stt.AssemblyAIStreamingTranscriber(
            on_partial_callback=on_partial_transcript,
            on_final_callback=on_final_transcript,
            api_key=api_keys.get("assemblyai"),
        )

        # Main receive loop
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive(), timeout=30.0)

                if data.get("type") == "websocket.disconnect":
                    logger.info("👋 Client sent disconnect frame.")
                    disconnected = True
                    break

                if "bytes" in data:
                    transcriber.stream_audio(data["bytes"])
                elif "text" in data:
                    msg = json.loads(data["text"])
                    logger.info(f"Received message: {msg.get('type', 'unknown')}")

            except asyncio.TimeoutError:
                continue

    except WebSocketDisconnect:
        logger.info("👋 Interview WebSocket disconnected")
        disconnected = True
    except RuntimeError as e:
        if "disconnect" in str(e).lower():
            logger.info("👋 WebSocket already disconnected — exiting cleanly.")
            disconnected = True
        else:
            logger.error(f"❌ WebSocket RuntimeError: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}", exc_info=True)
        if not disconnected:
            try:
                await websocket.send_json({
                    "type": "error",
                    "message": "An error occurred. Please try again.",
                })
            except Exception:
                pass
    finally:
        disconnected = True
        if 'transcriber' in locals() and transcriber:
            transcriber.close()
        logger.info("🧹 WebSocket cleanup complete")

##########################################################################################################

# # backend/api/websocket.py
# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# import logging
# import json
# import asyncio
# import base64
# import re
# import httpx

# # Import services
# from services import stt, llm, tts, question_generator

# router = APIRouter()
# logger = logging.getLogger(__name__)

# # ---------------------------------------------------------------------------
# # Configuration
# # ---------------------------------------------------------------------------

# # Canonical question counts per difficulty — single source of truth.
# # These match what the creation page shows the user.
# DIFFICULTY_QUESTION_COUNTS = {
#     "easy": 5,
#     "medium": 8,
#     "hard": 12,
#     "expert": 15,
# }

# # Phrases that trigger an early end.
# END_TRIGGERS = [
#     "end interview",
#     "end the interview",
#     "can we end",
#     "let's end",
#     "lets end",
#     "stop interview",
#     "stop the interview",
#     "i want to end",
#     "i'd like to end",
#     "that's all",
#     "thats all",
#     "we can stop",
#     "we can end",
#     "finish the interview",
#     "finish interview",
# ]


# # ---------------------------------------------------------------------------
# # Helpers
# # ---------------------------------------------------------------------------
# def is_end_request(text: str) -> bool:
#     """Return True if the user's transcript is asking to end the interview."""
#     normalized = text.strip().lower()
#     return any(trigger in normalized for trigger in END_TRIGGERS)


# async def load_questions_for_session(
#     interview_type: str,
#     difficulty: str,
#     api_key: str,
# ) -> list[str]:
#     """
#     Resolve the full question list for this session.

#     1. Make sure the question bank is loaded (idempotent).
#     2. Ask question_generator for exactly the right count of questions
#        for the given type + difficulty combo.
#     3. Return plain text strings — the websocket loop only needs the text.
#     """
#     # Ensure bank is populated (no-op after first call)
#     await question_generator.load_question_bank()

#     count = DIFFICULTY_QUESTION_COUNTS.get(difficulty, 5)  # fallback to easy

#     # generate_interview_questions returns [{"questionText": ..., ...}, ...]
#     question_dicts = question_generator.generate_interview_questions(
#         interview_type=interview_type,
#         difficulty=difficulty,
#         count=count,
#         api_key=api_key,
#     )

#     questions = [q["questionText"] for q in question_dicts]
#     logger.info(
#         f"📚 Loaded {len(questions)} questions | type={interview_type} "
#         f"difficulty={difficulty} (target={count})"
#     )
#     return questions


# async def generate_feedback_report(interview_log: list, difficulty: str, interview_type: str, api_key: str) -> str:
#     """
#     Call Groq to produce a structured feedback report.
#     interview_log is the dedicated list of {"question": ..., "answer": ...} dicts
#     recorded during the session.
#     """
#     transcript_lines = []
#     for i, entry in enumerate(interview_log, start=1):
#         transcript_lines.append(f"Q{i}: {entry['question']}")
#         transcript_lines.append(f"A{i}: {entry['answer']}")
#         transcript_lines.append("")
#     transcript_text = "\n".join(transcript_lines)

#     prompt = (
#         "You are an expert interview coach. Based on the mock interview transcript below, "
#         "generate a detailed feedback report for the candidate.\n\n"
#         f"Interview details — Type: {interview_type} | Difficulty: {difficulty}\n\n"
#         "The report must include exactly these sections:\n\n"
#         "1. OVERALL SCORE (out of 10)\n"
#         "2. STRENGTHS – what the candidate did well\n"
#         "3. AREAS FOR IMPROVEMENT – specific weaknesses or gaps observed\n"
#         "4. COMMUNICATION SKILLS – clarity, confidence, structure of answers\n"
#         "5. TECHNICAL KNOWLEDGE – depth and accuracy of technical responses\n"
#         "6. RECOMMENDATIONS – 3-5 actionable tips for the candidate\n\n"
#         "Be honest, constructive, and specific. Reference actual things the candidate said.\n"
#         f"Keep in mind the difficulty was set to {difficulty}, so calibrate expectations accordingly.\n\n"
#         "--- INTERVIEW TRANSCRIPT ---\n"
#         f"{transcript_text}\n"
#         "--- END TRANSCRIPT ---\n"
#     )

#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.post(
#                 "https://api.groq.com/openai/v1/chat/completions",
#                 headers={
#                     "Authorization": f"Bearer {api_key}",
#                     "Content-Type": "application/json",
#                 },
#                 json={
#                     "model": "llama-3.3-70b-versatile",
#                     "messages": [{"role": "user", "content": prompt}],
#                     "max_tokens": 1500,
#                     "temperature": 0.4,
#                 },
#                 timeout=30.0,
#             )
#             data = response.json()
#             return data["choices"][0]["message"]["content"]
#     except Exception as e:
#         logger.error(f"❌ Feedback report generation failed: {e}", exc_info=True)
#         return (
#             "Sorry, the feedback report could not be generated at this time. "
#             "Please review your interview manually."
#         )


# async def end_interview(websocket: WebSocket, interview_log: list, difficulty: str, interview_type: str, api_keys: dict, loop):
#     """
#     Shared routine: say goodbye via TTS, generate the feedback report from
#     interview_log, and push it to the frontend.
#     """
#     goodbye_msg = (
#         "Thank you for completing the interview! "
#         "I'm now generating your feedback report. Please wait a moment."
#     )

#     await websocket.send_json({"type": "ai_response", "text": goodbye_msg})
#     goodbye_audio = await loop.run_in_executor(
#         None, tts.speak, goodbye_msg, api_keys.get("murf")
#     )
#     if goodbye_audio:
#         await websocket.send_json({
#             "type": "ai_audio",
#             "audio": base64.b64encode(goodbye_audio).decode("utf-8"),
#         })

#     logger.info(f"📝 Generating feedback report… ({len(interview_log)} Q&A pairs logged)")
#     logger.info(f"📋 Interview log:\n{json.dumps(interview_log, indent=2)}")

#     report = await generate_feedback_report(interview_log, difficulty, interview_type, api_keys.get("groq"))

#     await websocket.send_json({
#         "type": "interview_report",
#         "report": report,
#         "transcript": interview_log,
#     })

#     logger.info("✅ Feedback report sent to client.")


# # ---------------------------------------------------------------------------
# # WebSocket handler
# # ---------------------------------------------------------------------------
# @router.websocket("/interview")
# async def interview_websocket(websocket: WebSocket):
#     """WebSocket endpoint for real-time interview sessions with voice"""
#     await websocket.accept()
#     logger.info("✅ Interview WebSocket connected")

#     api_keys = {}
#     chat_history = []
#     interview_log = []          # dedicated Q&A record
#     questions: list[str] = []   # resolved at config time from question_generator
#     question_count = 0          # index into `questions`
#     current_question = ""
#     interview_ended = False
#     difficulty = "easy"         # set from config
#     interview_type = "technical"  # set from config

#     loop = asyncio.get_event_loop()
#     disconnected = False

#     async def handle_transcript(text: str):
#         nonlocal question_count, current_question, disconnected, interview_ended

#         logger.info(f"🎤 User said: {text}")

#         if disconnected or interview_ended:
#             logger.warning("handle_transcript called after disconnect/end — ignoring.")
#             return

#         # --- Check for early-end voice command ---
#         if is_end_request(text):
#             logger.info("🛑 User requested early end of interview.")
#             await websocket.send_json({"type": "transcript_final", "text": text})
#             interview_ended = True
#             await end_interview(websocket, interview_log, difficulty, interview_type, api_keys, loop)
#             return

#         # Record this answer against whatever question is currently active
#         if current_question:
#             interview_log.append({
#                 "question": current_question,
#                 "answer": text
#             })
#             logger.info(f"📝 Logged Q&A pair #{len(interview_log)}")

#         # Send final transcript to frontend
#         await websocket.send_json({"type": "transcript_final", "text": text})

#         try:
#             # --- LLM response ---
#             if llm.should_search_web(text, api_keys.get("groq")):
#                 ai_response, updated_history = llm.get_web_response(
#                     text, chat_history, api_keys.get("groq"), api_keys.get("serpapi")
#                 )
#             else:
#                 ai_response, updated_history = llm.get_llm_response(
#                     text, chat_history, api_keys.get("groq")
#                 )

#             chat_history.clear()
#             chat_history.extend(updated_history)

#             # Send AI text response
#             await websocket.send_json({"type": "ai_response", "text": ai_response})

#             # --- TTS: stream audio sentence by sentence ---
#             sentences = re.split(r'(?<=[.?!])\s+', ai_response.strip())
#             for sentence in sentences:
#                 if disconnected or interview_ended:
#                     return
#                 if sentence.strip():
#                     audio_bytes = await loop.run_in_executor(
#                         None, tts.speak, sentence.strip(), api_keys.get("murf")
#                     )
#                     if audio_bytes:
#                         await websocket.send_json({
#                             "type": "ai_audio",
#                             "audio": base64.b64encode(audio_bytes).decode("utf-8"),
#                         })

#             # --- Decide: follow-up already asked? advance? or end? ---
#             ai_ends_with_question = ai_response.strip().endswith("?")

#             if ai_ends_with_question:
#                 # LLM asked a contextual follow-up — stay on current question index
#                 current_question = ai_response.strip()
#                 logger.info("🤖 LLM follow-up question — not advancing question list.")

#             elif question_count + 1 < len(questions):
#                 # Advance to next question in the resolved list
#                 await asyncio.sleep(2)
#                 question_count += 1

#                 next_question = questions[question_count]
#                 current_question = next_question

#                 await websocket.send_json({"type": "ai_response", "text": next_question})

#                 question_audio = await loop.run_in_executor(
#                     None, tts.speak, next_question, api_keys.get("murf")
#                 )
#                 if question_audio:
#                     await websocket.send_json({
#                         "type": "ai_audio",
#                         "audio": base64.b64encode(question_audio).decode("utf-8"),
#                     })

#                 logger.info(f"📢 Question {question_count + 1}/{len(questions)}: {next_question}")

#             else:
#                 # All questions exhausted — end interview
#                 logger.info(f"🏁 All {len(questions)} questions answered — ending interview.")
#                 interview_ended = True
#                 await end_interview(websocket, interview_log, difficulty, interview_type, api_keys, loop)

#         except Exception as e:
#             logger.error(f"❌ Error in interview pipeline: {e}", exc_info=True)
#             if not disconnected:
#                 try:
#                     await websocket.send_json({
#                         "type": "error",
#                         "message": "Sorry, I encountered an error processing your response.",
#                     })
#                 except Exception:
#                     pass

#     def on_final_transcript(text: str):
#         asyncio.run_coroutine_threadsafe(handle_transcript(text), loop)

#     def on_partial_transcript(text: str):
#         asyncio.run_coroutine_threadsafe(
#             websocket.send_json({"type": "transcript_partial", "text": text}),
#             loop,
#         )

#     try:
#         config_data = await websocket.receive_text()
#         config = json.loads(config_data)

#         if config.get("type") == "config":
#             api_keys = config.get("keys", {})
#             # Pull difficulty + interview_type sent by the frontend
#             difficulty = config.get("difficulty", "easy")
#             interview_type = config.get("interviewType", "technical")

#             logger.info(
#                 f"✅ Session config | keys={list(api_keys.keys())} "
#                 f"type={interview_type} difficulty={difficulty}"
#             )

#             # Resolve question list from the bank / AI generator
#             questions = await load_questions_for_session(
#                 interview_type, difficulty, api_keys.get("groq", "")
#             )

#             if not questions:
#                 # Safety net — should never happen but don't crash
#                 logger.error("❌ No questions resolved — aborting session.")
#                 await websocket.send_json({
#                     "type": "error",
#                     "message": "Failed to load questions. Please try again.",
#                 })
#                 return

#             # Send first question
#             first_question = questions[0]
#             current_question = first_question

#             await websocket.send_json({"type": "ai_response", "text": first_question})

#             first_audio = await loop.run_in_executor(
#                 None, tts.speak, first_question, api_keys.get("murf")
#             )
#             if first_audio:
#                 await websocket.send_json({
#                     "type": "ai_audio",
#                     "audio": base64.b64encode(first_audio).decode("utf-8"),
#                 })

#             logger.info(f"📢 Question 1/{len(questions)}: {first_question}")

#         # Initialize STT transcriber
#         transcriber = stt.AssemblyAIStreamingTranscriber(
#             on_partial_callback=on_partial_transcript,
#             on_final_callback=on_final_transcript,
#             api_key=api_keys.get("assemblyai"),
#         )

#         # Main receive loop
#         while True:
#             try:
#                 data = await asyncio.wait_for(websocket.receive(), timeout=30.0)

#                 if data.get("type") == "websocket.disconnect":
#                     logger.info("👋 Client sent disconnect frame.")
#                     disconnected = True
#                     break

#                 if "bytes" in data:
#                     transcriber.stream_audio(data["bytes"])
#                 elif "text" in data:
#                     msg = json.loads(data["text"])
#                     logger.info(f"Received message: {msg.get('type', 'unknown')}")

#             except asyncio.TimeoutError:
#                 continue

#     except WebSocketDisconnect:
#         logger.info("👋 Interview WebSocket disconnected")
#         disconnected = True
#     except RuntimeError as e:
#         if "disconnect" in str(e).lower():
#             logger.info("👋 WebSocket already disconnected — exiting cleanly.")
#             disconnected = True
#         else:
#             logger.error(f"❌ WebSocket RuntimeError: {e}", exc_info=True)
#     except Exception as e:
#         logger.error(f"❌ WebSocket error: {e}", exc_info=True)
#         if not disconnected:
#             try:
#                 await websocket.send_json({
#                     "type": "error",
#                     "message": "An error occurred. Please try again.",
#                 })
#             except Exception:
#                 pass
#     finally:
#         disconnected = True
#         if 'transcriber' in locals() and transcriber:
#             transcriber.close()
#         logger.info("🧹 WebSocket cleanup complete")

##########################################################################################################