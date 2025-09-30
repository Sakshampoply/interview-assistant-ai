# FastAPI Testing Guide

## Overview

Your Next.js app now uses **Python FastAPI** for backend logic instead of JavaScript. The APIs are implemented as Vercel serverless functions.

## File Structure

```
/api/
├── requirements.txt        # Python dependencies
├── main.py                # Main FastAPI app (for reference)
├── health.py              # Health check endpoint
├── parse-resume.py        # Resume parser endpoint
├── generate-questions.py  # Question generator endpoint
└── evaluate-answers.py    # Answer evaluator endpoint
```

## Local Development

### Option 1: Test via Next.js (Recommended)

The Python endpoints will work automatically when deployed to Vercel, but for local testing:

1. Visit `http://localhost:3000/test`
2. Use the interactive testing dashboard
3. The frontend will make requests to `/api/*` endpoints

### Option 2: Test Python Locally (Advanced)

To test Python logic locally:

```bash
# Install Python dependencies
pip install -r api/requirements.txt

# Run individual Python files for testing
python api/main.py
```

## API Endpoints

### 1. Health Check

- **URL**: `/api/health`
- **Method**: GET
- **Response**: Status and configuration info

### 2. Resume Parser

- **URL**: `/api/parse-resume`
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Body**: `resume` file (PDF/DOCX)
- **Response**: Extracted name, email, phone

### 3. Question Generator

- **URL**: `/api/generate-questions`
- **Method**: POST
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "role": "Full Stack Developer",
    "experience": "Mid-level",
    "skills": ["React", "Node.js", "JavaScript"]
  }
  ```
- **Response**: 6 questions with difficulty and time limits

### 4. Answer Evaluator

- **URL**: `/api/evaluate-answers`
- **Method**: POST
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "questions": [
      /* questions array from generator */
    ],
    "answers": [
      "answer1",
      "answer2",
      "answer3",
      "answer4",
      "answer5",
      "answer6"
    ]
  }
  ```
- **Response**: Individual scores, feedback, and overall summary

## Deployment

When you deploy to Vercel:

1. **Automatic Detection**: Vercel will detect Python files in `/api/` directory
2. **Dependencies**: It will install from `requirements.txt`
3. **Runtime**: Python 3.9 serverless functions
4. **Environment**: Your `GEMINI_API_KEY` will be available

## Environment Variables

Make sure these are set in Vercel:

- `GEMINI_API_KEY`: Your Google Gemini API key

## Testing Tips

1. **Start with Health Check**: Visit `/api/health` first
2. **Check Network Tab**: Monitor requests in browser DevTools
3. **Upload Test Files**: Create simple PDF/DOCX resumes for testing
4. **Rate Limits**: Remember Gemini free tier has 15 requests/minute
5. **Error Handling**: Python endpoints include detailed error messages

## Benefits of FastAPI Approach

- ✅ **Familiar Structure**: FastAPI syntax as you requested
- ✅ **Python AI Libraries**: Full access to Python Gemini SDK
- ✅ **Pydantic Models**: Type validation and documentation
- ✅ **Serverless**: No additional servers to manage
- ✅ **Vercel Integration**: Seamless deployment alongside Next.js
