import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { parse } from "marked";
import { v4 as uuidv4 } from "uuid";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIMessage = async (userInput: string): Promise<Message> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: uuidv4(),
          role: "assistant",
          content: `You said: ${userInput}`,
        });
      }, 500);
    });
  };

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

      const newMessage = await getAIMessage(trimmedInput);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  const handleEdit = (id: string) => {
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
      // Optionally, send the updated message to the backend here
      // await editMessage(id, message.content);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, isEditing: false } : msg
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    // Optionally, send a delete request to the backend here
    // await deleteMessage(id);
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== id)
    );
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${message.role}-message-container`}
          >
            {message.content && (
              <div className={`message ${message.role}-message`}>
                {message.isEditing ? (
                  <input
                    type="text"
                    value={message.content}
                    onChange={(e) =>
                      handleContentChange(message.id, e.target.value)
                    }
                    onBlur={() => saveEdit(message.id)}
                    autoFocus
                  />
                ) : (
                  <div
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
                    <button onClick={() => handleEdit(message.id)}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(message.id)}>
                      Delete
                    </button>
                  </div>
                )}
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

