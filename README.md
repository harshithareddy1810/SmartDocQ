# SmartDocQ — AI-Powered Document Intelligence Platform

SmartDocQ is a full-stack AI document assistant that allows users to upload documents and interact with their content through natural-language questions. The application combines a React frontend, Python Flask backend, PostgreSQL database, JWT authentication, and Google's Gemini AI to provide contextual answers from uploaded documents.

## 🌐 Live Demo

* **Frontend:** https://smartdocq-gfzj.onrender.com
* **Backend API:** https://smartdocq-backend.onrender.com

> The application is deployed on Render and can be accessed through the live frontend.

---

## ✨ Key Features

* 📄 Upload and work with document content
* 🤖 Ask natural-language questions about uploaded documents
* 🧠 AI-powered responses using Google's Gemini models
* 🔐 JWT-based user authentication
* 👤 User registration and login
* 🔑 Google Sign-In integration
* 🛡️ Protected API endpoints
* 🗄️ PostgreSQL-backed application data
* 🌐 RESTful backend APIs
* 📚 API documentation for core application endpoints
* 🚀 Deployed frontend and backend

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │  Upload / Question  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │  User Interface     │
                    │  Authentication     │
                    │  Document Workflow  │
                    └──────────┬──────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Flask Backend    │
                    │                     │
                    │ Authentication      │
                    │ API Endpoints       │
                    │ Application Logic   │
                    └───────┬───────┬─────┘
                            │       │
                            │       │
                            ▼       ▼
                   ┌────────────┐ ┌──────────────┐
                   │ PostgreSQL │ │ Gemini AI    │
                   │  Database  │ │   Model      │
                   └────────────┘ └──────────────┘
```

---

## 🔄 How It Works

### 1. User Authentication

Users can register and log in through the application.

Authentication is handled using JWT-based sessions, allowing protected API endpoints to verify authenticated requests.

### 2. Document Interaction

Users can upload documents through the frontend and interact with their content.

### 3. Ask Questions

Users submit natural-language questions about document content.

The frontend sends the request to the Flask backend through a protected REST API endpoint.

### 4. AI Processing

The backend processes the question and document context and sends the relevant information to Google's Gemini model.

### 5. Response

The generated response is returned through the backend API and displayed to the user through the React interface.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Vite

### Backend

* Python
* Flask
* REST APIs
* JWT Authentication

### AI

* Google Gemini
* Generative AI
* Natural-language document question answering

### Database

* PostgreSQL

### Authentication

* JWT
* Google OAuth / Google Sign-In

### Deployment

* Render

---

## 🔐 Authentication

SmartDocQ uses JWT-based authentication for protected API endpoints.

### Register

```http
POST /api/register
```

Request:

```json
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "1234"
}
```

Response:

```json
{
  "message": "Registered successfully!"
}
```

### Login

```http
POST /api/login
```

Request:

```json
{
  "email": "test@gmail.com",
  "password": "1234"
}
```

Response:

```json
{
  "token": "your_jwt_goes_here"
}
```

---

## 🤖 AI Question Answering

The core AI functionality is exposed through:

```http
POST /api/ask
```

This endpoint requires authentication.

### Request

```json
{
  "question": "What is binary search?",
  "context": "Binary search is an efficient algorithm..."
}
```

### Authorization

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Response

```json
{
  "answer": "Binary search is a fast search algorithm...",
  "citations": []
}
```

---

## ⚙️ Environment Variables

### Backend

Create a `.env` file inside the backend directory:

```env
FRONTEND_URL=your_frontend_url
SECRET_KEY=your_secret_key
GOOGLE_API_KEY=your_google_api_key
DATABASE_URL=your_postgres_connection_string
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
AI_ENABLED=true
```

### Frontend

```env
VITE_API_BASE=your_backend_url
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Security:** Never commit `.env` files, API keys, database credentials, passwords, or secret keys to GitHub.

---

## 🚀 Running Locally

### Prerequisites

Make sure you have:

* Python 3.x
* Node.js
* npm
* PostgreSQL
* Google Gemini API key

### Backend

Clone the repository:

```bash
git clone https://github.com/harshithareddy1810/SmartDocQ.git
cd SmartDocQ
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the backend environment variables:

```text
backend/.env
```

Start the Flask server:

```bash
python app.py
```

### Frontend

Navigate to the frontend directory:

```bash
cd smartdoc-frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variables:

```text
smartdoc-frontend/.env
```

Start the development server:

```bash
npm run dev
```

---

## 📁 Project Structure

```text
SmartDocQ/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.py
│   └── ...
│
├── smartdoc-frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── requirements.txt
├── README.md
└── ...
```

---

## 🔭 Future Improvements

Potential areas for further development include:

* More advanced document retrieval and ranking
* Vector-based document search
* Improved citation and source attribution
* AI-powered document summarization
* Multi-document question answering
* Document-level access controls
* AI workflow automation
* Automated evaluation of generated responses
* Improved observability and production monitoring

---

## 📚 What I Learned

Building SmartDocQ provided hands-on experience across the full application lifecycle, including:

* Designing a full-stack application architecture
* Developing REST APIs using Flask
* Implementing JWT-based authentication
* Integrating generative AI into an application
* Working with PostgreSQL-backed application data
* Connecting frontend and backend services
* Managing environment-based configuration
* Deploying frontend and backend services to a cloud platform
* Designing an AI-assisted workflow around real user interactions

---

## 👩‍💻 Author

**Harshitha Reddy**

Computer Science Engineering Undergraduate

* GitHub: https://github.com/harshithareddy1810
* LinkedIn: https://linkedin.com/in/harshitha-reddy-0721232b9

---

## ⭐ Project

If you find SmartDocQ interesting, feel free to explore the repository and try the live application.
