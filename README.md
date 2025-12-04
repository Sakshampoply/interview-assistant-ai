# AI-Powered Interview Assistant

Deployement Link:- https://ai-interview-assist-one.vercel.app/

This project is a comprehensive, AI-powered platform designed to automate and enhance the technical interview process. It leverages Google's Gemini AI to parse resumes, dynamically generate interview questions, and provide in-depth evaluations of candidate answers. The entire application is built as a modern, serverless web app.

## 🚀 Core Features

- **Automated Interview Flow**: A seamless, multi-step process from resume upload to final results.
- **AI-Powered Resume Parsing**: Extracts candidate details (name, email, phone) directly from PDF or DOCX resumes.
- **Dynamic Question Generation**: Creates tailored interview questions based on job role, experience level, and key skills.
- **Timed Responses**: Simulates a real interview environment with automatic timers for each question.
- **In-Depth Answer Evaluation**: Provides a score (0-10), detailed feedback, strengths, and areas for improvement for each answer.
- **Comprehensive Summaries**: Generates an overall score, hiring recommendation, and a summary of the candidate's performance.
- **Persistent Interview History**: Saves all completed interviews to the browser's local storage for review by an "interviewer".
- **Dual Dashboards**: Separate views for the "Interviewee" to take interviews and the "Interviewer" to review results.

## 🛠️ Tech Stack

- **Frontend**:
  - **Framework**: Next.js 14 (App Router)
  - **Language**: JavaScript
  - **Styling**: Tailwind CSS
  - **State Management**: Redux Toolkit, Redux Persist
- **Backend**:
  - **Runtime**: Python 3.9 Serverless Functions on Vercel
  - **API Layer**: Standard Python `http.server` (no frameworks)
- **AI**:
  - **Provider**: Google Gemini (`gemini-2.5-flash-lite-preview-09-2025`)
  - **SDK**: `google-generativeai` for Python
- **Deployment**:
  - **Platform**: Vercel

## 📊 Data Flow Diagram

The application follows a clear, linear data flow from user input to AI processing and finally to the user interface.

```
1. User Uploads Resume (PDF/DOCX)
   │
   └──> [Frontend: InterviewSetup.js]
        │
        └──> POST /api/parse-resume
             │
             └──> [Backend: parse-resume.py]
                  │   1. Extracts text from file (PyPDF2/python-docx)
                  │   2. Calls Gemini AI to extract Name, Email, Phone
                  │
             <─── Returns { name, email, phone }
        │
   <─── [Frontend: InterviewSetup.js]
        │   1. Populates form with extracted data
        │   2. User confirms details (Role, Experience, Skills)
        │
        └──> POST /api/generate-questions
             │
             └──> [Backend: generate-questions.py]
                  │   1. Calls Gemini AI with role, experience, skills
                  │
             <─── Returns Array of 6 Questions
        │
   <─── [Frontend: InterviewSession.js]
        │   1. Displays one question at a time with a timer
        │   2. User submits answers
        │
        └──> POST /api/evaluate-answers (at the end)
             │
             └──> [Backend: evaluate-answers.py]
                  │   1. Sends all questions and answers to Gemini AI
                  │
             <─── Returns Full Evaluation JSON
        │
   <─── [Frontend: Redux Store]
        │   1. `interviewSlice` status -> 'completed'
        │   2. `dashboardSlice` saves the full interview record
        │
        └──> [Frontend: InterviewResults.js / InterviewerTab.js]
             │   Displays the final report
             │
             └──> [Redux Persist]
                  Saves the `dashboardSlice` to Local Storage
```

## ⚡ Local Setup and Deployment

### Prerequisites

- Node.js (v18 or newer)
- Python (v3.9 recommended)
- `pip` for Python package installation
- A Google Gemini API Key.

### Setup Instructions

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/Sakshampoply/interview-assistant-ai.git
    cd interview-assistant-ai
    ```

2.  **Install Frontend Dependencies**:

    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**:
    It's recommended to use a virtual environment for Python dependencies.

    ```bash
    # Create and activate a virtual environment (optional but recommended)
    python3 -m venv .venv
    source .venv/bin/activate

    # Install Python packages
    pip install -r api/requirements.txt
    ```

4.  **Set Up Environment Variables**:
    Create a file named `.env.local` in the root of the project and add your Gemini API key:

    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`. The Vercel development environment will automatically handle running the Python serverless functions.

### Deployment

The project is configured for seamless deployment to Vercel.

1.  Push your code to a GitHub repository.
2.  Import the repository into your Vercel account.
3.  Add your `GEMINI_API_KEY` as an environment variable in the Vercel project settings.
4.  Deploy! Vercel will automatically detect the Next.js frontend and the Python API endpoints.

## 📈 Scaling and Future Enhancements

While the current serverless architecture is robust for many use cases, here are potential improvements for scaling the application:

- **Dedicated Backend Service**:

  - **Problem**: Serverless functions can have cold starts and execution time limits. Complex, long-running AI tasks might time out.
  - **Solution**: Migrate the Python API logic to a dedicated, long-running backend service (e.g., a Docker container hosted on Google Cloud Run, AWS Fargate, or Heroku). This provides more control over the environment and eliminates cold starts.

- **Database Integration**:

  - **Problem**: `redux-persist` stores data in the user's browser, which is not secure, scalable, or shareable.
  - **Solution**: Integrate a database (like PostgreSQL, MongoDB, or Firebase) to store user accounts, interview sessions, and results. This would enable user authentication and allow interviewers to see results from any device.

- **Asynchronous Job Queue**:

  - **Problem**: AI evaluation can take several seconds. The user currently has to wait for the API response.
  - **Solution**: Implement a job queue (like Celery with Redis or RabbitMQ). When an interview is completed, the frontend could submit the evaluation task to the queue. The backend worker would process it asynchronously and update the database. The frontend could then poll for the result or receive it via a WebSocket, providing a non-blocking user experience.

- **Improved State Management**:
  - **Problem**: The current Redux setup resets the `interview` slice on reload, which is intended behavior but could be improved.
  - **Solution**: With a database, the app could fetch the state of an "in-progress" interview from the backend on page load, allowing a user to resume an interrupted session.
