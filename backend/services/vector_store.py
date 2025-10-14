import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import uuid

class VectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts."""
        embeddings = self.embedding_model.encode(texts)
        return embeddings.tolist()
    
    def add_documents(self, documents: List, document_id: str) -> Dict:
        """Add document chunks to ChromaDB."""
        texts = [doc.page_content for doc in documents]
        embeddings = self.generate_embeddings(texts)
        
        # Generate unique IDs for each chunk
        ids = [f"{document_id}_chunk_{i}" for i in range(len(documents))]
        
        # Prepare metadata
        metadatas = []
        for i, doc in enumerate(documents):
            metadata = doc.metadata.copy()
            metadata['document_id'] = document_id
            metadata['chunk_index'] = i
            metadatas.append(metadata)
        
        # Add to collection
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        
        return {
            "document_id": document_id,
            "chunks_stored": len(documents),
            "chunk_ids": ids
        }
    
    def search(self, query: str, n_results: int = 5, document_id: str = None) -> List[Dict]:
        """Search for similar chunks."""
        query_embedding = self.generate_embeddings([query])[0]
        
        where_filter = {"document_id": document_id} if document_id else None
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter
        )
        
        return results
    
    def delete_document(self, document_id: str):
        """Delete all chunks of a document."""
        self.collection.delete(
            where={"document_id": document_id}
        )
