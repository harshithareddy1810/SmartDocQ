from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.vector_store import VectorStore

router = APIRouter()
vector_store = VectorStore(persist_directory="./chroma_db")

class QueryRequest(BaseModel):
    query: str
    document_id: str = None
    n_results: int = 5

@router.post("/query")
async def query_documents(request: QueryRequest):
    try:
        results = vector_store.search(
            query=request.query,
            n_results=request.n_results,
            document_id=request.document_id
        )
        
        return {
            "query": request.query,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
