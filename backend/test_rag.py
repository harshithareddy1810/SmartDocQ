# # # Add this line at the top of test_rag.py
# # from gemini_rag import get_embedding
# # query = "What is the document talking about?"
# # query_embedding = get_embedding(query)
# # results = collection.query(query_embeddings=[query_embedding], n_results=5)

# # context = "\n".join(results["documents"][0])
# # prompt = f"""Use the following context to answer the question:
# # {context}

# # Question: {query}
# # """

# # response = model.generate_content(prompt)
# # print("\n--- RAG Response ---\n")
# # print(response.text)
# # backend/test_rag.py
# import pytest
# import chromadb
# import google.generativeai as genai
# import os
# from app import embed_text as get_embedding

# # --- Test for your RAG logic ---
# def test_rag_full_flow():
#     """
#     Tests the full RAG flow: embedding, querying, and generation.
#     """
#     # 1. Setup (Initialize clients and models)
#     # This assumes your GOOGLE_API_KEY is set as an environment variable
#     genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
#     model = genai.GenerativeModel('gemini-1.5-flash')
    
#     # Initialize ChromaDB client (using an in-memory instance for testing)
#     client = chromadb.Client()
#     collection = client.get_or_create_collection(name="test_collection")

#     # Add a dummy document to the collection for the test
#     collection.add(
#         documents=["Binary search is an efficient algorithm for finding an item from a sorted list of items."],
#         ids=["doc1"]
#     )

#     # 2. The core logic of your test
#     query = "What is binary search?"
#     query_embedding = get_embedding(query)
#     results = collection.query(query_embeddings=[query_embedding], n_results=1)

#     context = "\n".join(results["documents"][0])
#     prompt = f"""Use the following context to answer the question:
#     {context}

#     Question: {query}
#     """

#     response = model.generate_content(prompt)
    
#     # 3. Assertions (Verify the results)
#     assert response, "The model should return a response."
#     assert isinstance(response.text, str), "The response text should be a string."
#     assert "algorithm" in response.text.lower(), "The response should be relevant to the query."

#     print("\n--- RAG Response ---\n")
#     print(response.text)