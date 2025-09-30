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

            # Default values
            role = body.get("role", "Full Stack Developer")
            experience = body.get("experience", "Mid-level")
            skills = body.get("skills", ["React", "Node.js", "JavaScript"])

            model = genai.GenerativeModel("gemini-2.5-flash-lite-preview-09-2025")

            prompt = f"""
            Generate exactly 6 interview questions for a {role} position with {experience} experience.
            Skills to focus on: {', '.join(skills)}
            
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

            response_data = {
                "success": True,
                "questions": questions,
                "totalQuestions": len(questions),
                "generatedAt": "2025-09-30T00:00:00Z",
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
            print(f"❌ Question generation failed: {str(e)}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            error_response = {
                "success": False,
                "error": f"Question generation failed: {str(e)}",
                "details": "Check the server logs for more information.",
            }
            self.wfile.write(json.dumps(error_response).encode("utf-8"))
