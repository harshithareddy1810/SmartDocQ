# backend/vector_store.py
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import os

# Memory-efficient ChromaDB configuration
_client = None

def get_client():
    global _client
    if _client is None:
        # Use persistent client with memory limits
        persist_directory = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        _client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True,
            )
        )
    return _client

def get_collection():
    client = get_client()
    return client.get_or_create_collection(name="documents")

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

def add_document(doc_id: int, text: str):
    """Add document to ChromaDB with chunking for memory efficiency"""
    collection = get_collection()
    # Split into smaller chunks to reduce memory usage
    chunk_size = 500
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    
    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            ids=[f"doc_{doc_id}_chunk_{i}"]
        )

def query_similar(query: str, n_results: int = 3):
    """Query similar documents"""
    collection = get_collection()
    results = collection.query(query_texts=[query], n_results=n_results)
    return results.get("documents", [[]])[0], results.get("distances", [[]])[0]
