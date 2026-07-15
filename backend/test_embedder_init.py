from app.services.similarity_engine import CodeBERTEmbedder
try:
    embedder = CodeBERTEmbedder()
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
