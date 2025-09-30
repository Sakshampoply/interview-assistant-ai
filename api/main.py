from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
import PyPDF2
from docx import Document
import json
import re
from pydantic import BaseModel
from typing import List, Optional
import io

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="AI Interview Assistant", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class QuestionRequest(BaseModel):
    role: str = "Full Stack Developer"
    experience: str = "Mid-level"
    skills: List[str] = ["React", "Node.js", "JavaScript"]


class Question(BaseModel):
    question: str
    difficulty: str
    timeLimit: int
    category: str


class AnswerEvaluationRequest(BaseModel):
    questions: List[Question]
    answers: List[str]


class AnswerEvaluation(BaseModel):
    score: int
    feedback: str
    suggestions: Optional[str] = None


class EvaluationResponse(BaseModel):
    evaluations: List[AnswerEvaluation]
    overallScore: int
    summary: str


# Utility functions
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")


def extract_contact_info_with_ai(text: str) -> dict:
    """Use Gemini AI to extract contact information from resume text"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        prompt = f"""
        Extract the following information from this resume text. Return ONLY a JSON object with these exact keys:
        - name: person's full name
        - email: email address
        - phone: phone number
        
        If any field is not found, set it to null.
        
        Resume text:
        {text}
        
        JSON:
        """

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean up the response to extract JSON
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]

        # Parse JSON
        contact_info = json.loads(result_text)
        return contact_info

    except json.JSONDecodeError:
        # Fallback: try to extract using regex
        return extract_contact_info_regex(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")


def extract_contact_info_regex(text: str) -> dict:
    """Fallback regex-based extraction"""
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    phone_pattern = r"(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"

    email_match = re.search(email_pattern, text)
    phone_match = re.search(phone_pattern, text)

    # Extract name (first line that looks like a name)
    lines = text.split("\n")
    name = None
    for line in lines:
        line = line.strip()
        if (
            line
            and len(line.split()) >= 2
            and not "@" in line
            and not any(char.isdigit() for char in line)
        ):
            name = line
            break

    return {
        "name": name,
        "email": email_match.group() if email_match else None,
        "phone": phone_match.group() if phone_match else None,
    }


# API Routes
@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "AI Interview Assistant API is running",
        "version": "1.0.0",
    }


@app.post("/parse-resume")
async def parse_resume(resume: UploadFile = File(...)):
    """Parse uploaded resume and extract contact information"""

    # Validate file type
    if not resume.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are supported"
        )

    # Check file size (5MB limit)
    file_content = await resume.read()
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    try:
        # Extract text based on file type
        if resume.filename.lower().endswith(".pdf"):
            text = extract_text_from_pdf(file_content)
        else:
            text = extract_text_from_docx(file_content)

        if not text.strip():
            raise HTTPException(
                status_code=400, detail="No text could be extracted from the file"
            )

        # Extract contact information using AI
        contact_info = extract_contact_info_with_ai(text)

        return {
            "success": True,
            "filename": resume.filename,
            "name": contact_info.get("name"),
            "email": contact_info.get("email"),
            "phone": contact_info.get("phone"),
            "extractedText": (
                text[:500] + "..." if len(text) > 500 else text
            ),  # First 500 chars for debugging
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Resume processing failed: {str(e)}"
        )


@app.post("/generate-questions")
async def generate_questions(request: QuestionRequest):
    """Generate interview questions using AI"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        prompt = f"""
        Generate exactly 6 interview questions for a {request.role} position with {request.experience} experience.
        Skills to focus on: {', '.join(request.skills)}
        
        Requirements:
        - 2 Easy questions (20 seconds each)
        - 2 Medium questions (60 seconds each) 
        - 2 Hard questions (120 seconds each)
        
        Return ONLY a JSON array with this exact structure:
        [
          {{
            "question": "question text",
            "difficulty": "Easy|Medium|Hard",
            "timeLimit": 20|60|120,
            "category": "technical category"
          }}
        ]
        
        Focus on practical, real-world scenarios and technical concepts.
        """

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean up the response
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]

        questions = json.loads(result_text)

        # Validate the structure
        if not isinstance(questions, list) or len(questions) != 6:
            raise ValueError("Invalid questions format")

        return {
            "success": True,
            "questions": questions,
            "totalQuestions": len(questions),
            "generatedAt": "2025-09-30T00:00:00Z",
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Question generation failed: {str(e)}"
        )


@app.post("/evaluate-answers")
async def evaluate_answers(request: AnswerEvaluationRequest):
    """Evaluate candidate answers using AI"""

    if len(request.answers) != len(request.questions):
        raise HTTPException(
            status_code=400, detail="Number of answers must match number of questions"
        )

    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Prepare questions and answers for evaluation
        qa_pairs = []
        for i, (question, answer) in enumerate(zip(request.questions, request.answers)):
            qa_pairs.append(
                f"""
Question {i+1} ({question.difficulty}): {question.question}
Answer: {answer}
"""
            )

        prompt = f"""
        Evaluate these interview answers for a Full Stack Developer position.
        
        {chr(10).join(qa_pairs)}
        
        For each answer, provide a score from 0-10 and detailed feedback.
        Also calculate an overall score (0-100) and provide a summary.
        
        Return ONLY a JSON object with this exact structure:
        {{
          "evaluations": [
            {{
              "score": 8,
              "feedback": "detailed feedback on the answer",
              "suggestions": "suggestions for improvement"
            }}
          ],
          "overallScore": 75,
          "summary": "overall performance summary"
        }}
        
        Consider:
        - Technical accuracy
        - Depth of knowledge
        - Practical application
        - Communication clarity
        - Problem-solving approach
        """

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean up the response
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]

        evaluation_result = json.loads(result_text)

        return {
            "success": True,
            "evaluations": evaluation_result["evaluations"],
            "overallScore": evaluation_result["overallScore"],
            "summary": evaluation_result["summary"],
            "evaluatedAt": "2025-09-30T00:00:00Z",
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Answer evaluation failed: {str(e)}"
        )


# For Vercel deployment
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
