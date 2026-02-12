# # backend/main.py
# from fastapi import FastAPI, WebSocket
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from contextlib import asynccontextmanager
# import logging
# import os
# from dotenv import load_dotenv

# # Import routers
# from api import interview, resume, feedback, questions, websocket

# # Load environment variables
# load_dotenv()

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# # Lifespan context manager for startup/shutdown
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     logger.info("🚀 Starting AI Interview Assistant Backend...")
    
#     # Initialize Firebase Admin SDK
#     from db.firebase_client import initialize_firebase
#     initialize_firebase()
#     logger.info("✅ Firebase Admin SDK initialized")
    
#     # Load question bank
#     from services.question_generator import load_question_bank
#     await load_question_bank()
#     #load_question_bank()
#     logger.info("✅ Question bank loaded")
    
#     yield
    
#     # Shutdown
#     logger.info("👋 Shutting down AI Interview Assistant Backend...")

# # Initialize FastAPI app
# app = FastAPI(
#     title="AI Interview Assistant API",
#     description="Backend API for AI-powered interview preparation platform",
#     version="1.0.0",
#     lifespan=lifespan
# )

# # CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Health check endpoint
# @app.get("/")
# async def root():
#     return {
#         "message": "AI Interview Assistant API",
#         "version": "1.0.0",
#         "status": "healthy"
#     }

# @app.get("/health")
# async def health_check():
#     return JSONResponse(
#         status_code=200,
#         content={
#             "status": "healthy",
#             "services": {
#                 "api": "operational",
#                 "firebase": "connected",
#                 "ai_services": "ready"
#             }
#         }
#     )

# # Include routers
# app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
# app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
# app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
# app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
# app.include_router(websocket.router, prefix="/api/ws", tags=["WebSocket"])

# # Global exception handler
# @app.exception_handler(Exception)
# async def global_exception_handler(request, exc):
#     logger.error(f"Global exception: {str(exc)}", exc_info=True)
#     return JSONResponse(
#         status_code=500,
#         content={
#             "error": "Internal server error",
#             "message": str(exc) if os.getenv("DEBUG") == "True" else "An error occurred"
#         }
#     )

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(
#         "main:app",
#         host=os.getenv("HOST", "0.0.0.0"),
#         port=int(os.getenv("PORT", 8000)),
#         reload=os.getenv("DEBUG", "False") == "True"
#     )



# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

# Import routers
from api import interview, resume, feedback, questions, websocket

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting AI Interview Assistant Backend...")
    
    # Initialize Firebase Admin SDK
    from db.firebase_client import initialize_firebase
    try:
        initialize_firebase()
        logger.info("✅ Firebase Admin SDK initialized")
    except Exception as e:
        logger.warning(f"⚠️ Firebase not initialized: {e}")
    
    # Load question bank
    from services.question_generator import load_question_bank
    await load_question_bank()
    logger.info("✅ Question bank loaded")
    
    yield
    
    logger.info("👋 Shutting down AI Interview Assistant Backend...")

app = FastAPI(
    title="AI Interview Assistant API",
    description="Backend API for AI-powered interview preparation platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AI Interview Assistant API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "services": {
                "api": "operational",
                "ai_services": "ready"
            }
        }
    )

# Include routers
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])

# WebSocket route - NO PREFIX for WebSocket
app.include_router(websocket.router, tags=["WebSocket"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )