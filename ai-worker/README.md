# ResolveOps AI Worker

This directory houses the background AI processing service for ResolveOps.

## Role in Architecture

In subsequent phases, ResolveOps offloads long-running and compute-heavy AI tasks from the main Express API server to this worker. The worker will handle:

1. **Ticket Classification:** Automatically classifying incoming tickets by topic, sentiment, urgency, and routing priority.
2. **Knowledge Retrieval (RAG):** Embedding documents, storing them in a vector database, and retrieving relevant technical documentation or past resolved tickets.
3. **Response Drafting:** Generating contextual suggested replies for human support agents to review.
4. **Queue Consumer:** Consuming jobs asynchronously from a Redis/Celery queue so API response times remain fast.

## Current State (Phase 1)

This service is currently an **initial foundation placeholder**:
- Provides a minimal FastAPI service with a `/health` check endpoint.
- Contains no model weights, LLM API calls, embeddings, or background queues yet.

## Prerequisites

- Python 3.10+ (Python 3.14+ supported)
- pip

## Running Locally on Windows

1. Open PowerShell and navigate to this directory:
   ```powershell
   cd c:\Desktop\resolveops\ai-worker
   ```

2. Create and activate a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Run the worker with Uvicorn:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

5. Verify health check:
   - Visit: `http://localhost:8000/health`
   - Interactive Swagger API docs: `http://localhost:8000/docs`
