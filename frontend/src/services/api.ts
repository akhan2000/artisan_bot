const API_URL = "http://localhost:8000";

export async function sendMessage(content: string, role: string = "user") {
    console.log("Sending request to:", `${API_URL}/messages/`);
    try {
        const response = await fetch(`${API_URL}/messages/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content, role }),
        });
        console.log("Response:", response);
        return response.json();
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

export async function getMessages() {
    try {
        const response = await fetch(`${API_URL}/messages/`);
        console.log("Response:", response);
        return response.json();
    } catch (error) {
        console.error("Error getting messages:", error);
    }
}

export async function deleteMessage(messageId: number) {
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}`, {
            method: "DELETE",
        });
        console.log("Response:", response);
        return response.json();
    } catch (error) {
        console.error("Error deleting message:", error);
    }
}

export async function updateMessage(messageId: number, newContent: string) {
    console.log("Updating message with ID:", messageId, "New content:", newContent);
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: newContent }),  // Ensuring the payload matches what the backend expects
        });
        console.log("Response:", response);
        return response.json();
    } catch (error) {
        console.error("Error updating message:", error);
    }
}