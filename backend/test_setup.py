# test_setup.py
print("Testing imports...")

try:
    import fastapi
    print("✅ FastAPI")
except:
    print("❌ FastAPI")

try:
    import firebase_admin
    print("✅ Firebase Admin")
except:
    print("❌ Firebase Admin")

try:
    from groq import Groq
    print("✅ Groq")
except:
    print("❌ Groq")

try:
    import assemblyai
    print("✅ AssemblyAI")
except:
    print("❌ AssemblyAI")

print("\n✅ Backend setup successful!")