from __future__ import annotations

from pypdf import PdfReader


def extract_pdf_text(file_bytes: bytes) -> str:
    reader = PdfReader(io_bytes := __import__("io").BytesIO(file_bytes))
    parts: list[str] = []
    for page in reader.pages:
        t = page.extract_text() or ""
        if t.strip():
            parts.append(t.strip())
    text = "\n\n".join(parts).strip()
    return text