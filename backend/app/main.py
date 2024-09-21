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
    "http://localhost:3000",
    "https://artisan-bot-five.vercel.app",  # Vercel frontend URL
    "https://artisan-n1w451egq-asfandyar-khans-projects.vercel.app",  # Add this Vercel frontend URL
    "https://artisanbot-production.up.railway.app"  # Backend URL
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
