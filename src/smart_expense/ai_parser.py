import re
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util

# Load models once
smart_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
ner = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

CATEGORIES = ["entertainment", "shopping", "others", "transport", "food"]
VALID_CATEGORIES = set(CATEGORIES)

def clean_text(text):
    # Remove non-useful garbage OCR characters
    cleaned = re.sub(r"[^a-zA-Z0-9\s\.\-:/₹,]", "", text)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)  # collapse multiple spaces
    cleaned = re.sub(r"[^\x00-\x7F]+", " ", cleaned)  # remove weird unicode
    return cleaned.strip()

def regex_fallback(text):
    # Robust money regex with ₹, INR, Rs. and optional comma
    money_match = re.search(r"(?:₹|Rs\.?|INR)?\s?(\d{1,3}(?:[,\d]{0,3})*(?:\.\d{1,2})?)", text)
    amount = money_match.group(1).replace(",", "") if money_match else None

    # Handles: 03/04/25, Apr 14 2025, 14-04-2025, etc.
    date_match = re.search(
        r"\b(?:\d{1,2}[-/\s])?(?:\d{1,2}|\w{3,9})[-/\s]?\d{2,4}\b",
        text,
        flags=re.IGNORECASE,
    )
    date = date_match.group(0) if date_match else None

    return amount, date

def smart_classify(text):
    result = smart_classifier(text, CATEGORIES)
    if result and "labels" in result:
        top = result["labels"][0]
        if top in VALID_CATEGORIES:
            return top

    # Fallback to cosine similarity
    text_embed = embedder.encode(text, convert_to_tensor=True)
    cat_embeds = embedder.encode(CATEGORIES, convert_to_tensor=True)
    sims = util.pytorch_cos_sim(text_embed, cat_embeds)
    best_idx = sims.argmax().item()
    return CATEGORIES[best_idx]

def extract_expense_entities(text: str) -> dict:
    text = clean_text(text)
    ner_entities = ner(text)

    # Attempt to collect entities by type
    dates, moneys = [], []
    for ent in ner_entities:
        word = ent["word"]
        if ent["entity_group"] == "DATE":
            dates.append(word)
        elif ent["entity_group"] == "MONEY":
            moneys.append(word)

    # Join chunks in case they were split weird
    date = " ".join(dates).strip() if dates else None
    amount = " ".join(moneys).strip() if moneys else None

    # Fallback if any is missing
    if not amount or not date:
        fallback_amount, fallback_date = regex_fallback(text)
        amount = amount or fallback_amount
        date = date or fallback_date

    category = smart_classify(text)

    return {
        "amount": amount,
        "date": date,
        "category": category
    }
