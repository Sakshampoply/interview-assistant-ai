from http.server import BaseHTTPRequestHandler
import json
import os
import google.generativeai as genai

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            # Parse JSON body
            body = {}
            if post_data:
                try:
                    body = json.loads(post_data.decode("utf-8"))
                except:
                    pass

            answers = body.get("answers", [])
            questions = body.get("questions", [])

            if not answers or not questions:
                raise ValueError("Answers and questions are required")

            model = genai.GenerativeModel("gemini-2.5-flash-lite-preview-09-2025")

            # Create evaluation prompt
            evaluation_prompt = f"""
            You are an expert technical interviewer. Evaluate the following interview answers:
            
            Questions and Answers:
            """

            for i, (question, answer) in enumerate(zip(questions, answers), 1):
                evaluation_prompt += f"""
            Question {i}: {question.get('question', '')}
            Difficulty: {question.get('difficulty', 'Medium')}
            Category: {question.get('category', 'Technical')}
            Candidate Answer: {answer.get('answer', '')}
            Time Taken: {answer.get('timeTaken', 0)} seconds
            
            """

            evaluation_prompt += """
            Provide a comprehensive evaluation with:
            1. Individual scores for each answer (0-10 scale)
            2. Detailed feedback for each answer
            3. Overall assessment
            4. Strengths and areas for improvement
            5. Final recommendation (Hire/Consider/Reject)
            
            Return ONLY a JSON object with this exact structure:
            {
              "overallScore": 0-10,
              "recommendation": "Hire|Consider|Reject",
              "summary": "brief overall assessment",
              "individualScores": [
                {
                  "questionIndex": 0,
                  "score": 0-10,
                  "feedback": "detailed feedback",
                  "strengths": ["strength1", "strength2"],
                  "improvements": ["improvement1", "improvement2"]
                }
              ],
              "totalTime": total_seconds,
              "strengths": ["overall strength1", "overall strength2"],
              "improvements": ["overall improvement1", "overall improvement2"]
            }
            """

            response = model.generate_content(evaluation_prompt)
            result_text = response.text.strip()

            # Clean up the response
            if result_text.startswith("```json"):
                result_text = result_text[7:-3]
            elif result_text.startswith("```"):
                result_text = result_text[3:-3]

            evaluation = json.loads(result_text)

            # Calculate total time from answers
            total_time = sum(answer.get("timeTaken", 0) for answer in answers)
            evaluation["totalTime"] = total_time

            response_data = {
                "success": True,
                "evaluation": evaluation,
                "evaluatedAt": "2025-09-30T00:00:00Z",
            }

            # Send response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

            self.wfile.write(json.dumps(response_data).encode("utf-8"))

        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            error_response = {
                "success": False,
                "error": f"Answer evaluation failed: {str(e)}",
            }
            self.wfile.write(json.dumps(error_response).encode("utf-8"))
