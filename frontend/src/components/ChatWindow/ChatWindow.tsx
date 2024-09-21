import React, { useState, useEffect, useRef, useContext } from "react";
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
  Tooltip,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LogoutIcon from '@mui/icons-material/Logout';
import { parse } from "marked";
import { sendMessage, deleteMessage, updateMessage, getMessages, clickAction, Message as APIMessage } from "../../services/api";
import "./ChatWindow.css";
import avatarImage from '../../assets/ava.png';  
import userAvatar from '../../assets/user-avatar.png';  
import elijahAvatar from '../../assets/elijah.png';  
import lucasAvatar from '../../assets/lucas.png';  
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface ChatMessage extends APIMessage {
  isEditing?: boolean;
}

const ChatWindow: React.FC = () => {
  const defaultMessage: ChatMessage[] = [];
  
  const { logout } = useContext(AuthContext); 
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
  }, [context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await getMessages(0, 100, context); // Pass context
      const filteredMessages = fetchedMessages.map(msg => ({ ...msg, isEditing: false }));
      setMessages(filteredMessages); 
      scrollToBottom();
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      try {
        const newMessage = await sendMessage(trimmedInput, "user", context);
        setMessages(prevMessages => [...prevMessages, { ...newMessage, isEditing: false }]);
        setInput("");
        await fetchMessages();
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

//   const handleSend = async () => {
//     const trimmedInput = input.trim();
//     if (trimmedInput) {
//         // Create a temporary message object
//         const tempMessage: ChatMessage = {
//             id: Date.now(), // Temporary ID
//             role: "user",
//             content: trimmedInput,
//             timestamp: new Date().toISOString(),
//             user_id: currentUser.id, // Ensure you have access to current user's ID
//             context: context,
//             isEditing: false,
//         };

//         // Optimistically add the message to the UI
//         setMessages(prevMessages => [...prevMessages, tempMessage]);
//         setInput("");

//         try {
//             const newMessage = await sendMessage(trimmedInput, "user", context);
//             // Replace the temporary message with the one from the server
//             setMessages(prevMessages => prevMessages.map(msg => msg.id === tempMessage.id ? newMessage : msg));
//         } catch (error) {
//             console.error("Failed to send message:", error);
//             // Optionally, remove the temporary message or notify the user
//             setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
//             // Display error message
//             setError("Failed to send message. Please try again.");
//         }
//     }
// };

  const handleEdit = (id: number) => {
    setEditingMessageId(id);
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === id ? { ...message, isEditing: true } : message
      )
    );
  };

  const handleAction = async (actionType: string) => {
    try {
      const response = await clickAction(actionType, context);
      console.log(response);
      setMessages(prevMessages => [...prevMessages, { ...response, isEditing: false }]);
      scrollToBottom();
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  const handleContentChange = (id: number, newContent: string) => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === id ? { ...message, content: newContent } : message
      )
    );
  };

  const saveEdit = async (id: number) => {
    const message = messages.find(msg => msg.id === id);
    if (message) {
      try {
        if (message.content.trim() === "") {
          await handleDelete(id);
        } else {
          const updatedMessage = await updateMessage(id, message.content);
          setMessages(prevMessages =>
            prevMessages.map(msg =>
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
      setMessages(prevMessages =>
        prevMessages.filter(message => message.id !== id)
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
    fetchMessages();
  };

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Define available actions based on context
  const actionTypesByContext: Record<string, string[]> = {
    "Onboarding": ["create_lead", "schedule_follow_up", "generate_email_template"],
    "Support": ["create_lead", "schedule_follow_up", "generate_email_template"],
    "Marketing": ["create_lead", "schedule_follow_up", "generate_email_template"],
  };

  // Helper function to get readable labels
  const getActionLabel = (actionType: string): string => {
    switch(actionType) {
      case "create_lead":
        return "Create Lead";
      case "schedule_follow_up":
        return "Schedule Follow-Up";
      case "generate_email_template":
        return "Generate Email";
      default:
        return "Action";
    }
  };

  // Render Action Buttons
  const renderActionButtons = () => {
    const actions = actionTypesByContext[context] || [];
    return (
      <div className="action-buttons">
        {actions.map(action => (
          <Tooltip key={action} title={getActionLabel(action)}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleAction(action)}
              style={{ margin: '4px', minWidth: '140px' }}
            >
              {getActionLabel(action)}
            </Button>
          </Tooltip>
        ))}
      </div>
    );
  };

  return (
    <div className={`chat-window ${theme}`}>
      <div className="chat-header">
        <IconButton onClick={handleFullscreen} className="fullscreen-icon">
          <FullscreenIcon />
        </IconButton>
        <IconButton onClick={handleLogout} className="logout-icon">
          <LogoutIcon />
        </IconButton>
        <div className="chat-header-left">
          <Avatar src={context === "Onboarding" ? avatarImage : context === "Support" ? elijahAvatar : lucasAvatar} alt="Chatbot Avatar" />
          <div className="chatbot-info">
            <h4>Hey👋, I'm {context === "Onboarding" ? "Ava" : context === "Support" ? "Elijah" : "Lucas"}</h4>
            <p>Ask me anything or pick a place to start</p>
          </div>
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
              src={
                message.role === "user" 
                  ? userAvatar 
                  : context === "Onboarding" 
                      ? avatarImage 
                      : context === "Support" 
                          ? elijahAvatar 
                          : lucasAvatar
              }
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

      {/* Action Buttons Section */}
      {renderActionButtons()}

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
            multiline
            maxRows={4} // Limit the number of visible rows
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    handleSend();
                    e.preventDefault(); // Prevents the addition of a new line
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
          <IconButton onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </div>
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
