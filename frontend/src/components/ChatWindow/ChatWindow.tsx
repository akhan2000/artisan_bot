// src/components/ChatWindow/ChatWindow.tsx

import React, { useState, useEffect, useRef, useContext } from "react";
import { Avatar, IconButton, TextField, Button, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import LogoutIcon from '@mui/icons-material/Logout';
import { parse } from "marked";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, deleteMessage, updateMessage, getMessages, Message as APIMessage } from "../../services/api";
import "./ChatWindow.css";
import avatarImage from '../../assets/ava.png';  // Chatbot avatar
import userAvatar from '../../assets/user-avatar.png';  // User avatar/Jaspar  
import elijahAvatar from '../../assets/elijah.png';  // Elijah avatar
import lucasAvatar from '../../assets/lucas.png';  // Lucas avatar
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

// Extend the APIMessage interface to include isEditing
interface ChatMessage extends APIMessage {
  isEditing?: boolean;
}

const ChatWindow: React.FC = () => {
  const defaultMessage: ChatMessage[] = [];
  
  const { logout } = useContext(AuthContext); // Access logout function
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessage);
  const [input, setInput] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [context, setContext] = useState("Onboarding");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await getMessages(0, 100); // Adjust as needed
      setMessages(fetchedMessages.map(msg => ({ ...msg, isEditing: false })));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      try {
        const newMessage = await sendMessage(trimmedInput, "user");
        setMessages((prevMessages) => [...prevMessages, { ...newMessage, isEditing: false }]);
        setInput("");

        // Optionally, trigger assistant response here
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleEdit = (id: number) => {
    setEditingMessageId(id);
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, isEditing: true } : message
      )
    );
  };

  const handleContentChange = (id: number, newContent: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, content: newContent } : message
      )
    );
  };

  const saveEdit = async (id: number) => {
    const message = messages.find((msg) => msg.id === id);
    if (message) {
      try {
        if (message.content.trim() === "") {
          await handleDelete(id); // If content is empty, treat it as a delete action
        } else {
          const updatedMessage = await updateMessage(id, message.content);
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

  const handleDelete = async (id: number) => {
    try {
      await deleteMessage(id);
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

  const handleContextChange = (event: SelectChangeEvent) => {
    const newContext = event.target.value as string;
    setContext(newContext);

    // Optionally, clear messages or set context-specific defaults
    // fetchMessages(); // Fetch messages based on new context if applicable
  };

  const handleLogout = () => {
    logout(); // Use context's logout function
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className={`chat-window ${theme}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <Avatar src={context === "Onboarding" ? avatarImage : context === "Support" ? elijahAvatar : lucasAvatar} alt="Chatbot Avatar" />
          <div className="chatbot-info">
            <h4>Hey👋, I'm {context === "Onboarding" ? "Ava" : context === "Support" ? "Elijah" : "Lucas"}</h4>
            <p>Ask me anything or pick a place to start</p>
          </div>
        </div>
        <div className="chat-header-right">
          <IconButton>
            <FullscreenIcon />
          </IconButton>
          <IconButton>
            <SplitscreenIcon />
          </IconButton>
          <IconButton onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={handleLogout}>
            <LogoutIcon />
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
              src={message.role === "user" ? userAvatar : context === "Onboarding" ? avatarImage : context === "Support" ? elijahAvatar : lucasAvatar}  //  avatarImage for assistant
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
        <div className="input-avatar-wrapper">
          <Avatar src={userAvatar} alt="User Avatar" className="input-avatar" />
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
        </div>
        <div className="input-row">
          <span className="context-label">Context</span>
          <Select
            value={context}
            onChange={handleContextChange}
            className="context-select"
            variant="outlined"
            size="small"
          >
            <MenuItem value="Onboarding">Onboarding</MenuItem>
            <MenuItem value="Support">Support</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
          </Select>
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon />
          </IconButton>
          <IconButton onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
      
      {/* Settings */}
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
