from datetime import datetime, timezone
from fastapi import FastAPI

app = FastAPI(
    title="ResolveOps AI Worker",
    description="Background AI processing worker placeholder for ResolveOps",
    version="0.1.0",
)


@app.get("/")
def read_root():
    return {
        "service": "resolveops-ai-worker",
        "status": "online",
        "version": "0.1.0",
        "phase": "Phase 1 - Initial Foundation Placeholder",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "resolveops-ai-worker",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "phase": "Phase 1 - Initial Foundation Placeholder",
    }
