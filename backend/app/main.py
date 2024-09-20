# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import messages
from .auth import router as auth_router

# Initialize the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Define allowed origins
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://artisan-2bssz8594-asfandyar-khans-projects.vercel.app/"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] to allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(messages.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Chatbot API"}
