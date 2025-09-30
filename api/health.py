from http.server import BaseHTTPRequestHandler
import os
import json


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Check if Gemini API key is configured
        api_key_configured = bool(os.getenv("GEMINI_API_KEY"))

        response_data = {
            "status": "healthy",
            "message": "Python FastAPI endpoints are ready",
            "apiKeyConfigured": api_key_configured,
            "version": "1.0.0",
            "runtime": "python3.9",
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

        self.wfile.write(json.dumps(response_data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
