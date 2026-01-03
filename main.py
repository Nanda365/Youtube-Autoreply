import importlib.util
import os
import sys

# This shim loads the backend FastAPI app so you can run
# `uvicorn main:app` from the repo root (D:/Youtube Autoreply).

BASE_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(BASE_DIR, "commentflow-ai", "backend")
BACKEND_MAIN = os.path.join(BACKEND_DIR, "main.py")

# Ensure backend folder is on sys.path so local imports like `from database import db`
# inside `backend/main.py` resolve when this shim is imported from the repo root.
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
    # also change working directory so relative file access inside backend works
    try:
        os.chdir(BACKEND_DIR)
    except Exception:
        pass

if not os.path.exists(BACKEND_MAIN):
    raise FileNotFoundError(f"Could not find backend main at {BACKEND_MAIN}")

spec = importlib.util.spec_from_file_location("backend_main", BACKEND_MAIN)
backend_main = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = backend_main
spec.loader.exec_module(backend_main)

try:
    app = backend_main.app
except Exception as e:
    raise RuntimeError("The backend module did not expose an `app` FastAPI instance") from e

if __name__ == "__main__":
    # Allow running this file directly for quick debugging
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
