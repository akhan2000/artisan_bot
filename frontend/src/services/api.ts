// src/services/api.ts

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Helper function to get the auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Define the Message interface to match the backend
export interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    user_id: number;
    context?: string; // Optional based on backend
}

export async function sendMessage(content: string, role: string = "user", context: string = "Onboarding"): Promise<Message> {
    try {
        const response = await axios.post<Message>(`${API_URL}/messages/`, { content, role, context }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

export async function getMessages(skip: number = 0, limit: number = 10): Promise<Message[]> {
    try {
        const response = await axios.get<Message[]>(`${API_URL}/messages/`, {
            headers: getAuthHeaders(),
            params: { skip, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
}

export async function deleteMessage(messageId: number): Promise<Message> {
    try {
        const response = await axios.delete<Message>(`${API_URL}/messages/${messageId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }
}

export async function updateMessage(messageId: number, newContent: string): Promise<Message> {
    try {
        const response = await axios.put<Message>(`${API_URL}/messages/${messageId}`, { content: newContent }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating message:", error);
        throw error;
    }
}

// User login function to retrieve and store JWT token
export async function login(username: string, password: string): Promise<{ access_token: string }> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    try {
        const response = await axios.post<{ access_token: string }>(`${API_URL}/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}


// User registration function
export async function register(username: string, password: string, email: string, firstName: string, lastName: string): Promise<Message> {
    try {
        const response = await axios.post<Message>(`${API_URL}/register`, {
            username,
            password,
            email,
            first_name: firstName,
            last_name: lastName,
        }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
}

// Logout function to clear the JWT token
export function logout() {
    localStorage.removeItem('token');
    console.log("User logged out, token removed from storage");
}
