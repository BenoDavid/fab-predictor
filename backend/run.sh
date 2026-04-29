#!/bin/bash

echo "============================"
echo "📌 Starting model training..."
echo "============================"

python app/ml/train.py

echo "============================"
echo "✅ Model training complete."
echo "============================"
echo "📌 Starting FastAPI server..."
echo "============================"

exec uvicorn app.main:app --host 0.0.0.0 --port 8000