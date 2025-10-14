from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from services.document_processor import DocumentProcessor
from services.vector_store import VectorStore
import uuid

router = APIRouter()

# Initialize services
doc_processor = DocumentProcessor(chunk_size=1000, chunk_overlap=200)
vector_store = VectorStore(persist_directory="./chroma_db")

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Validate file type
        if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPEG, and PNG files are allowed.")
        
        # Save the uploaded file to a temporary location
        file_location = f"temp_files/{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())
        
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        
        # Process document into chunks
        chunks = doc_processor.chunk_document(
            file_path=file_location,
            metadata={
                "filename": file.filename,
                "upload_date": datetime.now().isoformat(),
                "file_type": file.content_type
            }
        )
        
        # Store chunks in ChromaDB
        storage_result = vector_store.add_documents(chunks, document_id)
        
        return {
            "message": "Document uploaded and processed successfully",
            "document_id": document_id,
            "filename": file.filename,
            "chunks_created": storage_result["chunks_stored"],
            "file_path": file_location
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))