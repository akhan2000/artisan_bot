import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  IconButton,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { parse } from "marked";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, deleteMessage, updateMessage } from "../../services/api";
import "./ChatWindow.css";
import avatarImage from '../../assets/ava.png';  // Chatbot avatar
import userAvatar from '../../assets/user-avatar.png';  // User avatar

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
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
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
          setMessages((prevMessages) =>
            prevMessages.map((msg) => (msg.id === userMessage.id ? newMessage : msg))
          );
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

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.checked ? "dark" : "light");
    document.body.className = event.target.checked ? "dark-theme" : "light-theme";
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as string);
  };

  return (
    <div className={`chat-window ${theme}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <Avatar src={avatarImage} alt="Chatbot Avatar" />
          <div className="chatbot-info">
            <h4>Hey👋, I'm Ava</h4>
            <p>Ask me anything or pick a place to start</p>
          </div>
        </div>
        <div className="chat-header-right">
          <IconButton onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-container ${message.role === "user" ? "user-message" : "assistant-message"}`}
          >
            <Avatar 
              alt={`${message.role === "user" ? "User" : "Assistant"} Avatar`} 
              src={message.role === "user" ? userAvatar : avatarImage}  // Use avatarImage for assistant's messages
              className="message-avatar" 
            />
            {message.isEditing ? (
              <div className="message-edit">
                <TextField
                  variant="outlined"
                  value={message.content}
                  onChange={(e) => handleContentChange(message.id, e.target.value)}
                  size="small"
                  fullWidth
                />
                <Button onClick={() => saveEdit(message.id)} variant="contained" color="primary">
                  Save
                </Button>
              </div>
            ) : (
              <div
                className="message"
                dangerouslySetInnerHTML={{
                  __html: (parse(message.content) as string).replace(/<p>|<\/p>/g, ""),
                }}
              ></div>
            )}
            {message.role === "user" && !message.isEditing && (
              <div className="message-actions">
                <IconButton onClick={() => handleEdit(message.id)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleDelete(message.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          fullWidth
          size="small"
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend();
              e.preventDefault();
            }
          }}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </div>
      
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={toggleSettings}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Switch checked={theme === "dark"} onChange={handleThemeChange} />}
            label="Dark Mode"
          />
          <div style={{ marginTop: 16 }}>
            <p>Language</p>
            <Select value={language} onChange={handleLanguageChange} fullWidth>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
            </Select>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleSettings} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChatWindow;
