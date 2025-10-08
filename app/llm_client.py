import os, json, httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

_SYSTEM = (
  "You are a waste-disposal policy assistant. Given a CITY and a MATERIAL, "
  "output which BIN the item belongs in (Recycling, Compost, Landfill, Hazardous). "
  "Prefer city-specific policy if known; otherwise give the best state policy or general US recommendation and lower confidence."
)

# JSON to parse reliably
_PROMPT = """{system}
CITY: {city}
MATERIAL: {material}

Return ONLY this JSON (no prose):
{{
  "bin": "Recycling|Compost|Landfill|Hazardous|Unknown",
  "reasoning": "<one short sentence>",
  "confidence": 0.0-1.0
}}
"""

def ask_gemini(city: str, material: str, timeout_s: int = 12) -> dict:
    if not GEMINI_API_KEY:
        return {"bin": "Unknown", "reasoning": "GEMINI_API_KEY not set", "confidence": 0.0}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    prompt = _PROMPT.format(system=_SYSTEM, city=city, material=material)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 128},
    }

    with httpx.Client(timeout=timeout_s) as client:
        resp = client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    # Text is nested here:
    # data["candidates"][0]["content"]["parts"][0]["text"]
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    try:
        s, e = text.find("{"), text.rfind("}")
        obj = json.loads(text[s:e+1])
        obj["confidence"] = float(obj.get("confidence", 0.5))
        if obj.get("bin") not in {"Recycling","Compost","Landfill","Hazardous","Unknown"}:
            obj["bin"] = "Unknown"
        return obj
    except Exception:
        return {"bin": "Unknown", "reasoning": "Parse failure", "confidence": 0.0}
