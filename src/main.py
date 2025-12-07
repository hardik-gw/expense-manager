import io
import re
import cv2
import numpy as np
import easyocr
import dateparser.search
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from smart_expense.ai_parser import extract_expense_entities

# ----- FastAPI app -----
app = FastAPI()

# ----- CORS Middleware -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 👈 Frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Models -----
class LoginRequest(BaseModel):
    email: str
    password: str

class AIParseRequest(BaseModel):
    text: str

# ----- OCR reader -----
ocr_reader = easyocr.Reader(['en'], gpu=False)

# ----- OCR Text Extraction -----
def extract_text_from_image(image_bytes: bytes) -> str:
    image_np = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    results = ocr_reader.readtext(gray, detail=0)
    return " ".join(results)

# ----- Routes -----
@app.get("/")
def root():
    return {"message": "🔥 FastAPI OCR Parser is lit 🔥"}

@app.post("/login")
def login(request: LoginRequest):
    if request.email == "test@example.com" and request.password == "password":
        return {"token": "fake-jwt-token"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = extract_text_from_image(contents)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@app.post("/parse-text")
def parse_text(request: AIParseRequest):
    try:
        parsed_data = extract_expense_entities(request.text)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")
