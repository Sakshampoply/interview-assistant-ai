# AI-Powered Interview Assistant

A Next.js application with integrated **FastAPI backend** for conducting technical interviews. Features resume parsing, dynamic question generation, and comprehensive answer evaluation using Google's Gemini AI.

## 🚀 Features

### FastAPI Backend APIs

- **Resume Parser** (`/api/parse-resume`): Upload PDF/DOCX files and extract personal information using AI
- **Question Generator** (`/api/generate-questions`): Generate 6 tailored Full Stack Developer interview questions
- **Answer Evaluator** (`/api/evaluate-answers`): Comprehensive AI evaluation with scores and feedback

### Core Capabilities

- ✅ **FastAPI** serverless functions integrated with Next.js
- ✅ Smart resume parsing with AI extraction (PDF/DOCX support)
- ✅ Dynamic question generation for Full Stack roles
- ✅ Timed questions: Easy (20s), Medium (60s), Hard (120s)
- ✅ Comprehensive answer evaluation with detailed feedback
- ✅ Rate limiting optimized for Gemini free tier (15 RPM)
- ✅ Python-powered AI logic with FastAPI structure
- ✅ Vercel serverless deployment ready

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: **FastAPI** (Python) as Vercel serverless functions
- **AI**: Google Gemini 2.0 Flash Exp (Python SDK)
- **File Processing**: PyPDF2, python-docx
- **Deployment**: Vercel (Python + Node.js)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## ⚡ Quick Start

1. **Clone and Install**

   ```bash
   git clone <your-repo-url>
   cd swipe
   npm install
   ```

2. **Environment Setup**

   ```bash
   # Add your Gemini API key to .env.local
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 API Endpoints

### 1. Resume Parser

```http
POST /api/parse-resume
Content-Type: multipart/form-data

# Body: FormData with 'resume' field (PDF/DOCX file)
```

### 2. Question Generator

```http
POST /api/generate-questions
Content-Type: application/json

{
  "candidateInfo": {
    "name": "John Doe",
    "extractedText": "Background summary..."
  }
}
```

### 3. Answer Evaluator

```http
POST /api/evaluate-answers
Content-Type: application/json

{
  "questions": [...], // Array of question objects
  "answers": [...],   // Array of answer strings
  "candidateInfo": {...} // Optional candidate context
}
```

## 🧪 Testing the APIs

You can test the APIs using the provided utility functions in `/src/lib/apiClient.js`.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── parse-resume/route.js       # Resume parser endpoint
│   │   ├── generate-questions/route.js # Question generator endpoint
│   │   ├── evaluate-answers/route.js   # Answer evaluator endpoint
│   │   └── route.js                    # API status endpoint
│   ├── globals.css
│   ├── layout.js
│   └── page.js                         # Landing page
├── lib/
│   ├── gemini.js                       # Gemini AI configuration
│   ├── resumeParser.js                 # Resume processing utilities
│   ├── prompts.js                      # AI prompt templates
│   └── apiClient.js                    # API testing utilities
└── ...
```

## 🚀 Deployment

Deploy to Vercel and set your `GEMINI_API_KEY` environment variable in the dashboard.

## 🎯 Next Steps

This backend foundation is ready for frontend integration with Redux, chat interface, and dashboard components.
