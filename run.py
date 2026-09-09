import os
import sys
import time
import socket
import subprocess
import webbrowser
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def kill_port_process(port: int):
    """Kills any process currently listening on the specified port (Windows & Unix)."""
    try:
        if sys.platform.startswith("win"):
            cmd = f'powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"'
            subprocess.run(cmd, shell=True, capture_output=True)
        else:
            subprocess.run(f"fuser -k {port}/tcp", shell=True, capture_output=True)
    except Exception:
        pass

def is_port_open(port: int, host: str = "127.0.0.1") -> bool:
    """Checks if a port is currently listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def load_env_keys():
    """Loads API keys from .env file for display."""
    env_file = ROOT_DIR / ".env"
    if not env_file.exists():
        env_file = BACKEND_DIR / ".env"
    
    gemini_key = ""
    parallel_key = ""
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    gemini_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                elif line.startswith("PARALLEL_API_KEY="):
                    parallel_key = line.split("=", 1)[1].strip().strip('"').strip("'")
    return gemini_key, parallel_key

def main():
    print("\n" + "=" * 70)
    print("        🎬  SHOWRUNNER AI — AUTONOMOUS CREATOR STUDIO  🎬       ")
    print("=" * 70)
    print(">> Initializing local full-stack studio on your device...")

    # 1. Clean up any previous stale instances
    print(">> Checking port 8000 (Backend) and port 5173 (Frontend)...")
    kill_port_process(8000)
    kill_port_process(5173)
    time.sleep(1)

    # 2. Inspect API Keys
    gemini_key, parallel_key = load_env_keys()
    masked_g = f"{gemini_key[:8]}...{gemini_key[-4:]}" if gemini_key else "NOT CONFIGURED (Simulation Mode)"
    masked_p = f"{parallel_key[:6]}...{parallel_key[-4:]}" if parallel_key else "NOT CONFIGURED (Simulation Mode)"

    # Read configurable host/port from .env (with sensible defaults)
    backend_host = os.getenv("HOST", "127.0.0.1")
    backend_port = os.getenv("PORT", "8000")
    print(f">> Launching FastAPI Multi-Agent Engine on http://{backend_host}:{backend_port}...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", "app.main:app",
        "--host", backend_host,
        "--port", backend_port,
        "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR),
    )

    # 4. Start Frontend
    print(">> Launching DeepSeek Studio Frontend on http://localhost:5173...")
    npm_cmd = "npm.cmd" if sys.platform.startswith("win") else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(FRONTEND_DIR),
    )

    # 5. Wait for both servers to be responsive
    print(">> Waiting for studio services to establish connection...", end="", flush=True)
    attempts = 0
    backend_ready = False
    frontend_ready = False

    while attempts < 30:
        time.sleep(0.5)
        print(".", end="", flush=True)
        if not backend_ready and is_port_open(8000):
            backend_ready = True
        if not frontend_ready and is_port_open(5173):
            frontend_ready = True
        if backend_ready and frontend_ready:
            break
        attempts += 1
    print("\n")

    # 6. Display Terminal Interface Banner
    print("=" * 70)
    print("              ✨  STUDIO READY & ACTIVE  ✨             ")
    print("=" * 70)
    print(f"  • Local Web Studio  :  http://localhost:5173")
    print(f"  • Backend API URL   :  http://127.0.0.1:8000/api")
    print(f"  • Google Gemini 2.5 :  {masked_g}")
    print(f"  • Parallel Web MCP  :  {masked_p}")
    print(f"  • Mode              :  FACTORY RESET (Zero synthetic data)")
    print("=" * 70)
    print(">> Automatically launching your browser to http://localhost:5173...")
    print(">> Press [ Ctrl + C ] in this terminal to gracefully stop the studio.\n")

    # 7. Automatically open browser
    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    # 8. Keep running until Ctrl+C
    try:
        while True:
            time.sleep(1)
            # Ensure child processes haven't terminated unexpectedly
            if backend_proc.poll() is not None:
                print(">> Warning: Backend process ended unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print(">> Warning: Frontend process ended unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\n>> Shutting down Showrunner AI Studio...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        kill_port_process(8000)
        kill_port_process(5173)
        print(">> Studio stopped safely. Goodbye!")

if __name__ == "__main__":
    main()
