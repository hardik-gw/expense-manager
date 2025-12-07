import cv2
import numpy as np
import tempfile
from easyocr import Reader
from PIL import Image
import io

reader = Reader(['en'], gpu=False)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    # Convert bytes to NumPy image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    # Resize for better OCR accuracy (scaling small receipts)
    image_np = cv2.resize(image_np, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Convert to grayscale
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Adaptive threshold to handle varying lighting
    thresh = cv2.adaptiveThreshold(
        blurred, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        11, 2
    )

    # Morphological operations to close gaps
    kernel = np.ones((2, 2), np.uint8)
    morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return morph

def extract_text_from_image(image_bytes: bytes) -> str:
    preprocessed_img = preprocess_image(image_bytes)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmpfile:
        cv2.imwrite(tmpfile.name, preprocessed_img)
        results = reader.readtext(tmpfile.name, detail=0, paragraph=True)

    return "\n".join(results)
