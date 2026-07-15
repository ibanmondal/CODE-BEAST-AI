from langchain_core.embeddings import Embeddings
from langchain_community.vectorstores import FAISS

class MockEmbedder(Embeddings):
    def embed_documents(self, texts):
        return [[1.0, 2.0]] * len(texts)
    def embed_query(self, text):
        return [1.0, 2.0]

try:
    db = FAISS.from_texts(["hello"], MockEmbedder())
    print("Success")
except Exception as e:
    print("Error:", e)
