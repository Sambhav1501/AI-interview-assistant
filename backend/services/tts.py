# backend/services/tts.py
import requests
import base64
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Correct endpoint: /v1/speech/generate (not /v1/speech)
MURF_API_URL = "https://api.murf.ai/v1/speech/generate"

# Ensure uploads folder exists
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def speak(text: str, api_key: str, output_file: str = "stream_output.wav") -> bytes:
    """
    Convert text to speech using the Murf REST API.
    Returns raw audio bytes, or b"" on failure.
    """
    # --- Guard: missing key or empty text ---
    if not api_key:
        logger.error("TTS error: Murf API key is None or empty. "
                     "Check that 'murf' key is stored in localStorage on the frontend.")
        return b""

    if not text or not text.strip():
        logger.warning("TTS called with empty text — skipping.")
        return b""

    # --- Call Murf REST API ---
    # Auth header is "api-key", NOT "Authorization: Bearer ..."
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
    }

    payload = {
        "text": text.strip(),
        "voiceId": "en-US-ken",
        "style": "Conversational",
        "format": "WAV",
        # Return audio as base64 inline in the JSON response
        # so we don't need a second request to download the audioFile URL
        "encodeAsBase64": True,
    }

    try:
        logger.info(f"TTS request → Murf API | voice=en-US-ken | text={text[:60]!r}...")
        response = requests.post(MURF_API_URL, headers=headers, json=payload, timeout=30)

        logger.info(f"TTS response ← status={response.status_code} | "
                    f"content-type={response.headers.get('Content-Type', 'unknown')}")

        if response.status_code != 200:
            logger.error(f"TTS error: Murf returned {response.status_code}. "
                         f"Response body: {response.text}")
            return b""

        # Parse JSON response
        data = response.json()

        # encodedAudio contains the base64-encoded WAV when encodeAsBase64 is true
        encoded_audio = data.get("encodedAudio")
        if not encoded_audio:
            logger.error(f"TTS error: 'encodedAudio' missing from response. "
                         f"Full response keys: {list(data.keys())}")
            # Fallback: if encodeAsBase64 didn't work, audioFile URL is returned instead
            audio_url = data.get("audioFile")
            if audio_url:
                logger.info(f"TTS fallback: downloading audio from URL: {audio_url}")
                dl = requests.get(audio_url, timeout=30)
                if dl.status_code == 200:
                    audio_bytes = dl.content
                else:
                    logger.error(f"TTS fallback download failed: {dl.status_code}")
                    return b""
            else:
                logger.error("TTS error: neither 'encodedAudio' nor 'audioFile' in response.")
                return b""
        else:
            # Decode the base64 string into raw bytes
            audio_bytes = base64.b64decode(encoded_audio)

        if len(audio_bytes) == 0:
            logger.error("TTS error: decoded audio is empty.")
            return b""

        # Persist to disk for debugging
        file_path = UPLOADS_DIR / output_file
        with open(file_path, "wb") as f:
            f.write(audio_bytes)
        logger.info(f"TTS audio saved → {file_path} ({len(audio_bytes)} bytes)")

        return audio_bytes

    except requests.exceptions.Timeout:
        logger.error("TTS error: Request to Murf API timed out after 30s.")
        return b""
    except requests.exceptions.ConnectionError as e:
        logger.error(f"TTS error: Could not connect to Murf API. Details: {e}")
        return b""
    except Exception as e:
        logger.error(f"TTS error: Unexpected failure: {e}", exc_info=True)
        return b""