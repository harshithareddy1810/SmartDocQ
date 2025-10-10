# backend/vector_store.py
import chromadb
from sentence_transformers import SentenceTransformer

# Persistent local vector store
chroma_client = chromadb.PersistentClient(path="chromadb_store")
collection = chroma_client.get_or_create_collection(name="smartdocq_docs")

# Embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

def add_document(doc_id: int, text: str):
    """Add or update document embeddings in ChromaDB."""
    if not text.strip():
        return
    embedding = model.encode([text])
    collection.add(
        ids=[str(doc_id)],
        documents=[text],
        embeddings=embedding.tolist()
    )

def query_similar(query: str, top_k: int = 3):
    """Retrieve most similar documents."""
    query_emb = model.encode([query])
    results = collection.query(
        query_embeddings=query_emb.tolist(),
        n_results=top_k
    )
    docs = results.get("documents", [[]])[0]
    ids = results.get("ids", [[]])[0]
    return docs, ids
