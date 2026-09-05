"""
Live diagnostic script to test Groq API connectivity and authentication.

Usage:
    # From workspace root:
    backend\\.venv\\Scripts\\python backend/test_groq_live.py

    # Or from backend directory with activated venv:
    python test_groq_live.py
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

# Add backend directory to sys.path so app modules can be imported
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import get_settings
from app.llm.groq_client import chat_completion, chat_completion_json, get_fast_model


def mask_key(key: str) -> str:
    """Safely mask key for display without leaking secrets."""
    if not key:
        return "<EMPTY>"
    if len(key) <= 8:
        return "*" * len(key)
    return f"{key[:4]}...{key[-4:]}"


def main() -> int:
    print("=" * 60)
    print("       GROQ API LIVE CONNECTIVITY & AUTHENTICATION TEST       ")
    print("=" * 60)

    settings = get_settings()
    raw_key = settings.groq_api_key.strip()

    print(f"[*] Fast Model:    {settings.groq_fast_model}")
    print(f"[*] Smart Model:   {settings.groq_smart_model}")
    print(f"[*] API Key:       {mask_key(raw_key)}")

    if not raw_key or raw_key in ("your_groq_api_key_here", "gsk_..."):
        print("\n[!] FAIL: GROQ_API_KEY is not set or is still a placeholder.")
        print("    Please paste your real key into backend/.env:")
        print("    GROQ_API_KEY=gsk_your_actual_groq_api_key_here")
        print("\n    Then re-run this script.")
        return 1

    print("\n[1/2] Testing basic live chat completion...")
    start_time = time.perf_counter()
    try:
        reply = chat_completion(
            model=get_fast_model(),
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Respond with exactly: 'Groq API is live and operational!'"},
            ],
            temperature=0.0,
        )
        elapsed = time.perf_counter() - start_time
        print(f"    -> Response: \"{reply.strip()}\"")
        print(f"    -> Latency:  {elapsed:.2f}s")
        print("    -> Status:   OK")
    except Exception as exc:
        print(f"    -> ERROR during live completion: {exc}")
        return 1

    print("\n[2/2] Testing structured JSON mode completion...")
    start_time = time.perf_counter()
    try:
        json_reply = chat_completion_json(
            model=get_fast_model(),
            messages=[
                {"role": "system", "content": "Return valid JSON with key 'status' set to 'ok' and 'timestamp' set to current unix seconds as an integer."},
                {"role": "user", "content": "Generate the status JSON."},
            ],
            temperature=0.0,
        )
        elapsed = time.perf_counter() - start_time
        print(f"    -> Response: {json_reply}")
        print(f"    -> Latency:  {elapsed:.2f}s")
        print("    -> Status:   OK")
    except Exception as exc:
        print(f"    -> ERROR during JSON completion: {exc}")
        return 1

    print("\n" + "=" * 60)
    print(" [SUCCESS] Groq API is fully functional, reachable, and authenticated!")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
