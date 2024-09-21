
//api.ts

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";


/**
 * Retrieves the authentication headers containing the JWT token.
 * This function checks localStorage for a stored token and, if found,
 * returns an object with the Authorization header set.
 *
 * @returns {Object} An object containing the Authorization header if a token exists.
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Interface representing the structure of a Message object.
 * This ensures type safety when handling message data.
 */
export interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    user_id: number;
    context?: string; // Optional context to categorize or group messages
}

/**
 * Sends a new message to the backend API.
 *
 * @param {string} content - The content of the message to be sent.
 * @param {string} role - The role of the sender ("user" or "assistant"). Defaults to "user".
 * @param {string} context - The context/category of the message. Defaults to "Onboarding".
 * @returns {Promise<Message>} A promise that resolves to the sent Message object.
 *
 * @throws Will throw an error if the request fails.
 */
export async function sendMessage(content: string, role: string = "user", context: string = "Onboarding"): Promise<Message> {
    try {
        const response = await axios.post<Message>(`${API_URL}/messages/`, { content, role, context }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(), // Attach auth headers if available
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error; // Propagate error to be handled by the caller
    }
}

export async function clickAction(actionType: string, context: string): Promise<Message> {
    try {
        const response = await axios.post<Message>(`${API_URL}/messages/click_action`, { action_type: actionType, context }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error handling click action:", error);
        throw error;
    }
}
/**
 * Retrieves a list of messages from the backend API with pagination support.
 *
 * @param {number} skip - The number of messages to skip (for pagination). Defaults to 0.
 * @param {number} limit - The maximum number of messages to retrieve. Defaults to 10.
 * @returns {Promise<Message[]>} A promise that resolves to an array of Message objects.
 *
 * @throws Will throw an error if the request fails.
 */
export async function getMessages(skip: number = 0, limit: number = 10, context: string = "Onboarding"): Promise<Message[]> {
    try {
        const response = await axios.get<Message[]>(`${API_URL}/messages/`, {
            headers: getAuthHeaders(),
            params: { skip, limit, context }, // Pass context as a query parameter
        });
        return response.data;
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
}

/**
 * Deletes a specific message identified by its ID.
 *
 * @param {number} messageId - The unique identifier of the message to delete.
 * @returns {Promise<Message>} A promise that resolves to the deleted Message object.
 *
 * @throws Will throw an error if the request fails.
 */
export async function deleteMessage(messageId: number): Promise<Message> {
    try {
        const response = await axios.delete<Message>(`${API_URL}/messages/${messageId}`, {
            headers: getAuthHeaders(), // Attach auth headers if available
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting message:", error);
        throw error; // Propagate error to be handled by the caller
    }
}

/**
 * Updates the content of an existing message.
 *
 * @param {number} messageId - The unique identifier of the message to update.
 * @param {string} newContent - The new content for the message.
 * @returns {Promise<Message>} A promise that resolves to the updated Message object.
 *
 * @throws Will throw an error if the request fails.
 */
export async function updateMessage(messageId: number, newContent: string): Promise<Message> {
    try {
        const response = await axios.put<Message>(`${API_URL}/messages/${messageId}`, { content: newContent }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(), // Attach auth headers if available
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating message:", error);
        throw error; // Propagate error to be handled by the caller
    }
}
export interface Token {
    access_token: string;
    token_type: string;
}
/**
 * Authenticates a user with the backend API using their credentials.
 *
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<{ access_token: string }>} A promise that resolves to an object containing the access token.
 *
 * @throws Will throw an error if the authentication fails.
 */
export async function login(username: string, password: string): Promise<{ access_token: string }> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    try {
        const response = await axios.post<{ access_token: string }>(`${API_URL}/login`, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // Content type for form data
        });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error; // Propagate error to be handled by the caller
    }
}

/**
 * Registers a new user with the backend API.
 *
 * @param {string} username - The desired username for the new account.
 * @param {string} password - The desired password for the new account.
 * @param {string} email - The user's email address.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {Promise<Message>} A promise that resolves to a Message object upon successful registration.
 *
 * @throws Will throw an error if the registration fails.
 */
export async function register(username: string, password: string, email: string, firstName: string, lastName: string): Promise<Token> {
    try {
        const response = await axios.post<Token>(`${API_URL}/register`, {
            username,
            password,
            email,
            first_name: firstName,
            last_name: lastName,
        }, {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(), // Attach auth headers if available
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error; // Propagate error to be handled by the caller
    }
}


/**
 * Logs out the current user by removing the authentication token from localStorage.
 * This effectively de-authenticates the user in the frontend application.
 */
export function logout() {
    localStorage.removeItem('token');
    console.log("User logged out, token removed from storage");
}
