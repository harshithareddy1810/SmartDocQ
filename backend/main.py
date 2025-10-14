from fastapi import FastAPI
from routes import query

app = FastAPI()

app.include_router(query.router, prefix="/api", tags=["query"])