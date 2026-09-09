import sys
import time
import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows consoles
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
parallel_key = os.getenv("PARALLEL_API_KEY", "").strip()

print("==================================================================")
print("       SHOWRUNNER AI - LIVE API KEY USAGE VERIFICATION           ")
print("==================================================================")

# 1. Test Parallel Web Search
print("\n[1/2] CHECKING PARALLEL WEB SYSTEMS KEY...")
if not parallel_key:
    print("[ERROR] PARALLEL_API_KEY is not set in .env")
else:
    masked_p = f"{parallel_key[:6]}...{parallel_key[-4:]}"
    print(f"  Key Detected : {masked_p} (Length: {len(parallel_key)})")
    try:
        from parallel import Parallel
        t0 = time.time()
        client = Parallel(api_key=parallel_key)
        res = client.search(
            objective="Verification test for live key usage",
            search_queries=["Apollo 11 telemetry records"],
            mode="fast"
        )
        duration = round((time.time() - t0) * 1000, 2)
        results = getattr(res, "results", [])
        print(f"  Status       : [OK] LIVE CALL SUCCEEDED in {duration}ms")
        print(f"  Results Count: {len(results)} live web pages indexed")
        for idx, item in enumerate(results[:2]):
            print(f"    - [{idx+1}] {item.title}")
            print(f"        URL: {item.url}")
    except Exception as e:
        print(f"  Status       : [FAILED] - {e}")

# 2. Test Gemini API Key
print("\n[2/2] CHECKING GOOGLE GEMINI API KEY...")
if not gemini_key:
    print("[ERROR] GEMINI_API_KEY is not set in .env")
else:
    masked_g = f"{gemini_key[:8]}...{gemini_key[-4:]}"
    print(f"  Key Detected : {masked_g} (Length: {len(gemini_key)})")
    try:
        from google import genai
        t0 = time.time()
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Respond with exactly 5 words acknowledging key verification."
        )
        duration = round((time.time() - t0) * 1000, 2)
        print(f"  Status       : [OK] LIVE CALL SUCCEEDED in {duration}ms")
        print(f"  Model Used   : gemini-2.5-flash")
        print(f"  Model Output : \"{response.text.strip()}\"")
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            meta = response.usage_metadata
            print(f"  Token Telemetry: Prompt Tokens = {meta.prompt_token_count}, Output Tokens = {meta.candidates_token_count}")
    except Exception as e:
        print(f"  Status       : [FAILED] - {e}")

print("\n==================================================================")
print("Where to view official provider usage dashboards:")
print("• Google AI Studio: https://aistudio.google.com/app/apikey (Quota & Usage)")
print("• Parallel Platform: https://platform.parallel.ai (Logs & Credits)")
print("==================================================================")
