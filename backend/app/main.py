from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import messages
from .database import engine, Base

# db tables 
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS for network communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# router for messages
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the chat API"}
