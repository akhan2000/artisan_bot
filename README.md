# Artisan AI Chat Assistant

Welcome to the **Artisan AI Chat Assistant** project! This application leverages OpenAI's GPT-4 model to simulate AI employees (Artisans) that assist users in various contexts such as Onboarding, Support, and Marketing. The platform consolidates essential sales tools into a single, exceptional interface, providing users with AI-powered assistance to enhance their B2B outbound demand generation processes, troubleshoot technical issues, and optimize marketing strategies.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Using the Chat Interface](#using-the-chat-interface)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
  - [Coding Standards](#coding-standards)
  - [How to Contribute](#how-to-contribute)
  - [Reporting Issues](#reporting-issues)
- [License](#license)
- [Contact Information](#contact-information)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Contextual AI Assistance**: Switch between different assistant personas based on context:
  - **Ava**: AI Business Development Representative for Onboarding.
  - **Elijah**: AI Support Expert for technical assistance.
  - **Lucas**: AI Marketing Strategist for marketing insights.

- **Interactive Chat Interface**: Engage in conversations with AI assistants through a user-friendly chat UI.

- **Message Editing and Deletion**:
  - **Edit**: Modify your most recent message to correct errors or update information.
  - **Delete**: Remove any of your messages along with the assistant's corresponding response.

- **Action Buttons**: Quick access to context-specific actions like creating leads, scheduling follow-ups, and generating email templates.

- **User Authentication**: Secure user registration and login with JWT authentication.

- **Theme Customization**: Toggle between light and dark modes.

- **Responsive Design**: Optimized for both desktop and mobile devices.

- **Error Handling**: User-friendly error messages and input validation.

---

## Technology Stack

**Frontend**:

- **React.js** with **TypeScript** for building the user interface.
- **Material-UI (MUI)** for UI components and styling.
- **Marked.js** for Markdown parsing.

**Backend**:

- **FastAPI** (Python) for building RESTful APIs.
- **SQLAlchemy** as the ORM for database management.
- **PostgreSQL** for production database.
- **SQLite** for local development database.
- **Pydantic** for data validation and settings management.
- **OpenAI API** for GPT-4 integration.

**Deployment**:

- **Vercel** for deploying the frontend application.
- **Railway** for hosting the backend and **PostgreSQL** database.

**Others**:

- **JWT** (JSON Web Tokens) for secure authentication.
- **Docker** (optional) for containerization and deployment.
- **Environment Variables** for configuration management.

---

## Architecture

The application follows a client-server architecture:

- **Frontend**: Handles the user interface, makes API calls to the backend, and manages application state using React hooks and context.
- **Backend**: Provides API endpoints for user authentication, message handling, and interaction with the OpenAI API for generating assistant responses.
- **Database**: Stores user data and conversation history using SQLite through SQLAlchemy ORM.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Python** (v3.7 or higher)
- **Virtual Environment Tool** (e.g., `venv`, `conda`)
- **OpenAI API Key** (sign up at [OpenAI](https://platform.openai.com/signup/))

---

### Installation

#### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/akhan2000/artisan_bot.git
   cd artisan-ai-chat-assistant/backend

2. **Create a Virtual Environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

3. **Install Dependencies**

- Install the required Python packages using the provided requirements file:

```bash
pip install -r requirements.txt
```

4. **Set Up Environment Variables**

- To configure your environment, follow these steps:

    - Create a .env file in the backend directory.
```bash
touch .env
```
- Add your OpenAI API Key to the .env file as follows:

```bash
OPENAI_API_KEY=your-openai-api-key
```

 
- Generate JWT Secret Key

    - You need to generate a secret key for JWT authentication. Run the key.py file to generate it.

- Run the file:
```bash
python key.py
```

- Copy the output and add it to your .env file:
```bash
JWT_SECRET_KEY=your-generated-secret-key
```

5. **Initialize the Database**

- Set Up Database URL for Local Testing
    - In your .env file, add the following for SQLite database configuration:
```bash
    DATABASE_URL=sqlite:///./test.db
```

- The database will automatically initialize when you run the application for the first time.

6. **Run the Backend Server**

```bash
uvicorn app.main:app --reload
```

- The backend API will be accessible at http://localhost:8000.

#### Frontend Setup

1. **Navigate to the Frontend Directory**

```bash
cd ../frontend
```

2. **Install Dependencies**


```bash
npm install
```

3. **Run the Frontend Application**

```bash
npm start
```
- The frontend will be accessible at http://localhost:3000.

## Usage
### Running the Application

- Start the Backend
    -Ensure your virtual environment is activated and run:
```bash
uvicorn app.main:app --reload
```

- Start the Frontend
    - In a separate terminal window, navigate to the frontend directory and run:
```bash
npm start
```

### Using the Chat Interface
1. **Access the Application**

- Open your web browser and navigate to http://localhost:3000.

2. **Register a New Account**

- Click on the "Register" link.
- Fill out the registration form with a username, email, and password.

3. **Login**

- Use your newly created credentials to log in.

4. **Select a Context**

- Use the context dropdown to select one of the following:
    - Onboarding
    - Support
    - Marketing

5. **Interact with the Assistant**

- Type your message in the input area and press Enter or click the Send icon.
- The assistant will respond based on the selected context.

6. **Edit and Delete Messages**

- Edit: Click the edit icon on your most recent message to modify it.
- Delete: Click the delete icon on any of your messages to remove it and the corresponding assistant response.

7. **Use Action Buttons**

- Action buttons provide quick access to context-specific tasks.
- Examples include "Create Lead," "Schedule Follow-Up," and "Generate Email."

8. **Adjust Settings**

- Click on the Settings icon to toggle Dark Mode.

9. **Logout and Account Options**

- Click on your avatar in the top-right corner to access options like Feedback, Support, and Logout.

## Project Structure
```bash
artisan-ai-chat-assistant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── message.py
│   │   │   └── user.py
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   ├── message.py
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── messages.py
│   │   │   └── users.py
│   │   └── ...
│   ├── .env
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── ava.png
│   │   │   ├── elijah.png
│   │   │   ├── lucas.png
│   │   │   └── user-avatar.png
│   │   ├── components/
│   │   │   ├── ChatWindow/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   └── ChatWindow.css
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── User.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── ...
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── README.md
└── ...
```

## Contributing
- We welcome contributions! Please follow these guidelines to contribute to the project.

### Coding Standards
- Code Style: Follow the existing coding style and conventions.
- Comments: Use clear and concise comments where necessary.
- Testing: Write unit tests for new features and bug fixes.
- Commits: Write descriptive commit messages.

### How to Contribute
1. **Fork the Repository**
- Click on the "Fork" button at the top right of the repository page.

2. **Clone Your Fork**
```bash
git clone https://github.com/akhan2000/artisan_bot
```

3. **Create a New Branch**
```bash
git checkout -b feature/your-feature-name
```
4. **Make Your Changes**
    -Implement your feature or bug fix.

5. **Commit and Push**

```bash
git add .
git commit -m "Add your commit message here"
git push origin feature/your-feature-name
```

6. **Create a Pull Request**
- Go to the original repository on GitHub.
- Click on "Pull Requests" and then "New Pull Request."
- Select your branch and submit the pull request.

### Reporting Issues
- Use the GitHub Issues page to report bugs or request features.
- Provide as much detail as possible, including steps to reproduce the issue.

## License
This project is licensed under the MIT License.

## Contact Information

- Email: support@artisan.co
- Website: https://www.artisan.co
- GitHub: https://github.com/akhan2000/artisan_bot

## Acknowledgments
- Artisan: Big thank you to Jaspar, and the engineering team for the opportunity and inspiration!
- OpenAI: For providing the GPT-4 API.
- Contributors: Thanks to all who have contributed to this project.
- Community: For the continuous support and feedback.
