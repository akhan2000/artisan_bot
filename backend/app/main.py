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
    "https://artisan-bot-five.vercel.app/",  # Add your Vercel frontend URL here
    "https://artisanbot-production.up.railway.app"  # Your backend URL
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
