from sentence_transformers import SentenceTransformer, util

# Load the model once when the server starts (not on every request — that would be slow)
model = SentenceTransformer('all-MiniLM-L6-v2')

def compute_match_score(resume_text: str, jd_text: str) -> float:
    if not resume_text or not jd_text:
        return 0.0

    embeddings = model.encode([resume_text, jd_text], convert_to_tensor=True)
    similarity = util.cos_sim(embeddings[0], embeddings[1])
    score = similarity.item()  # convert tensor to plain Python float

    # cosine similarity ranges roughly -1 to 1, but for text it's usually 0 to 1
    # convert to a 0-100 percentage for easier display
    percentage = round(max(0, min(100, score * 100)), 1)
    return percentage