@echo off
echo Starting FastAPI backend...
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
