# backend/tests/test_app.py
import pytest
from app import app
from unittest.mock import patch

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# --- API Testing ---
def test_register_and_login(client):
    """
    Integration Test: Tests the full registration and login API flow.
    """
    # Test user registration
    register_res = client.post('/api/register', json={
        'name': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert register_res.status_code == 201
    assert b'Registered successfully!' in register_res.data

    # Test user login with correct credentials
    login_res = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert login_res.status_code == 200
    assert b'token' in login_res.data

# --- Unit Testing ---
# Note: For a simple unit test, we'll assume a helper function exists.
# Let's pretend you have a simple function in prompts.py:
# def format_greeting(name):
#     return f"Hello, {name}!"

from prompts import format_greeting # Assuming this function is in prompts.py

def test_format_greeting_unit():
    """
    Unit Test: Tests a single, isolated function.
    """
    assert format_greeting("World") == "Hello, World!"

# --- Mocking External Services ---
def test_ask_endpoint_with_mocking(client):
    """
    API Test: Tests the /ask endpoint by mocking the external Gemini API.
    """
    # First, log in to get a token
    client.post('/api/register', json={'name': 'mockuser', 'email': 'mock@example.com', 'password': 'password'})
    login_res = client.post('/api/login', json={'email': 'mock@example.com', 'password': 'password'})
    token = login_res.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Patch the genai.GenerativeModel().generate_content method
    with patch('google.generativeai.GenerativeModel.generate_content') as mock_gemini:
        # Configure the mock to return a predictable, fake response
        mock_gemini.return_value.text = '{"answer": "This is a mocked AI answer."}'
        
        # Call the protected /ask endpoint
        ask_res = client.post('/api/ask', headers=headers, json={
            "question": "What is the capital of France?",
            "context": "Some document text."
        })

        assert ask_res.status_code == 200
        assert b"This is a mocked AI answer." in ask_res.data