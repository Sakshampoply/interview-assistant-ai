from http.server import BaseHTTPRequestHandler
import json
import os
import io
import re
import google.generativeai as genai

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    import PyPDF2

    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from docx import Document

    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


def extract_text_from_pdf(file_data):
    """Extract text from PDF file data"""
    if not PDF_AVAILABLE:
        raise ValueError("PyPDF2 not available for PDF processing")

    try:
        pdf_file = io.BytesIO(file_data)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_docx(file_data):
    """Extract text from DOCX file data"""
    if not DOCX_AVAILABLE:
        raise ValueError("python-docx not available for DOCX processing")

    try:
        docx_file = io.BytesIO(file_data)
        doc = Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")


def parse_multipart_form_data(post_data, boundary):
    """Parse multipart form data to extract file"""
    try:
        boundary = boundary.encode()
        parts = post_data.split(b"--" + boundary)

        for part in parts:
            if b"Content-Disposition: form-data" in part and b"filename=" in part:
                # Find the start of file content (after headers)
                header_end = part.find(b"\r\n\r\n")
                if header_end != -1:
                    file_content = part[header_end + 4 :]
                    # Remove trailing boundary markers
                    if file_content.endswith(b"\r\n"):
                        file_content = file_content[:-2]
                    return file_content

        raise ValueError("No file found in form data")
    except Exception as e:
        raise ValueError(f"Failed to parse form data: {str(e)}")


def extract_contact_info_with_ai(text: str) -> dict:
    """Use Gemini AI to extract contact information from resume text"""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash-lite-preview-09-2025")

        def get_info(prompt):
            response = model.generate_content(prompt)
            return response.text.strip()

        name_prompt = (
            f"Extract the full name from this text: {text}. Only return the name."
        )
        email_prompt = (
            f"Extract the email from this text: {text}. Only return the email."
        )
        phone_prompt = f"Extract the phone number from this text: {text}. Only return the phone number."

        name = get_info(name_prompt)
        email = get_info(email_prompt)
        phone = get_info(phone_prompt)

        # Basic validation/cleanup
        if "@" not in email:
            email = None
        if not any(char.isdigit() for char in phone):
            phone = None

        contact_info = {
            "name": name if name else None,
            "email": email if email else None,
            "phone": phone if phone else None,
        }

        print(f"✅ Extracted Contact Info: {contact_info}")
        return contact_info

    except Exception as e:
        print(f"❌ General Error in AI extraction: {e}")
        # Fallback to regex on the original text if AI fails
        return extract_with_regex(text)


def extract_with_regex(text: str) -> dict:
    """Fallback to regex extraction if AI/JSON fails."""
    import re

    print("↪️ Falling back to regex extraction.")

    # More specific regex patterns
    name_match = re.search(r"^(?:[A-Z][a-z'-]+(?:\s|$)){2,}", text)
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)

    contact_info = {
        "name": name_match.group(0).strip() if name_match else None,
        "email": email_match.group(0).strip() if email_match else None,
        "phone": phone_match.group(0).strip() if phone_match else None,
    }
    print(f"✅ Extracted Contact Info via Regex: {contact_info}")
    return contact_info


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

            if not post_data:
                raise ValueError("No file data provided")

            # Get content type to handle multipart form data
            content_type = self.headers.get("Content-Type", "")

            if "multipart/form-data" in content_type:
                # Extract boundary from content type
                boundary_start = content_type.find("boundary=")
                if boundary_start == -1:
                    raise ValueError("No boundary found in multipart data")

                boundary = content_type[boundary_start + 9 :]
                file_data = parse_multipart_form_data(post_data, boundary)

                # Determine file type and extract text
                if file_data.startswith(b"%PDF"):
                    # PDF file
                    resume_text = extract_text_from_pdf(file_data)
                elif file_data.startswith(b"PK"):
                    # DOCX file (ZIP-based)
                    resume_text = extract_text_from_docx(file_data)
                else:
                    # Try to decode as text
                    try:
                        resume_text = file_data.decode("utf-8")
                    except UnicodeDecodeError:
                        raise ValueError(
                            "Unsupported file format. Please upload PDF, DOCX, or TXT files."
                        )
            else:
                # Direct text content
                resume_text = post_data.decode("utf-8")

            if len(resume_text.strip()) < 10:
                raise ValueError(
                    "Resume content too short - please provide a complete resume"
                )

            # Extract contact information using AI
            contact_info = extract_contact_info_with_ai(resume_text)

            response_data = {
                "success": True,
                "filename": "uploaded_resume",
                "name": contact_info.get("name"),
                "email": contact_info.get("email"),
                "phone": contact_info.get("phone"),
                "extractedText": (
                    resume_text[:500] + "..." if len(resume_text) > 500 else resume_text
                ),
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

            self.wfile.write(json.dumps(response_data).encode("utf-8"))

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            error_response = {
                "success": False,
                "error": f"Resume processing failed: {str(e)}",
            }
            self.wfile.write(json.dumps(error_response).encode("utf-8"))
