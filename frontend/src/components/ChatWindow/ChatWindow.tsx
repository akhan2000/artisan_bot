import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { parse } from "marked";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, deleteMessage, updateMessage } from "../../services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEditing?: boolean;
}

const ChatWindow: React.FC = () => {
  const defaultMessage: Message[] = [
    {
      id: uuidv4(),
      role: "assistant",
      content: "Hi, how can I help you today?",
    },
  ];

  const [messages, setMessages] = useState<Message[]>(defaultMessage);
  const [input, setInput] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: trimmedInput,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");

      try {
        const newMessage = await sendMessage(trimmedInput, "user");
        if (newMessage) {
          setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === userMessage.id ? newMessage : msg)));
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleEdit = (id: string) => {
    setEditingMessageId(id);
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, isEditing: true } : message
      )
    );
  };

  const handleContentChange = (id: string, newContent: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, content: newContent } : message
      )
    );
  };

  const saveEdit = async (id: string) => {
    const message = messages.find((msg) => msg.id === id);
    if (message) {
      try {
        if (message.content.trim() === "") {
          await handleDelete(id); // If content is empty, treat it as a delete action
        } else {
          const updatedMessage = await updateMessage(parseInt(message.id), message.content);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === id ? { ...updatedMessage, isEditing: false } : msg
            )
          );
          setEditingMessageId(null);
        }
      } catch (error) {
        console.error("Failed to update message:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(parseInt(id));
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message.id !== id)
      );
      setEditingMessageId(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${message.role}-message-container`}
          >
            {message.isEditing ? (
              <>
                <input
                  type="text"
                  value={message.content}
                  onChange={(e) =>
                    handleContentChange(message.id, e.target.value)
                  }
                  autoFocus
                />
                <button onClick={() => saveEdit(message.id)}>Save</button>
              </>
            ) : (
              <div
                className={`message ${message.role}-message`}
                dangerouslySetInnerHTML={{
                  __html: (parse(message.content) as string).replace(
                    /<p>|<\/p>/g,
                    ""
                  ),
                }}
              ></div>
            )}
            {message.role === "user" && !message.isEditing && (
              <div className="message-actions">
                <button onClick={() => handleEdit(message.id)}>Edit</button>
                <button onClick={() => handleDelete(message.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend();
              e.preventDefault();
            }
          }}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
