// src/components/ChatWindow/ChatWindow.tsx

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
  Menu,
  Typography
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LogoutIcon from '@mui/icons-material/Logout';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { parse } from "marked";
import { sendMessage, deleteMessage, updateMessage, getMessages, clickAction, Message as APIMessage } from "../../services/api";
import "./ChatWindow.css";
import avatarImage from '../../assets/ava.png';  
import userAvatar from '../../assets/user-avatar.png';  
import elijahAvatar from '../../assets/elijah.png';  
import lucasAvatar from '../../assets/lucas.png';  
import { AuthContext } from '../../context/AuthContext';



interface ChatMessage extends APIMessage {
  isEditing?: boolean;
  is_edited: boolean;
  is_deleted: boolean;
}

const ChatWindow: React.FC = () => {
  const defaultMessage: ChatMessage[] = [];
  
  const { logout, user } = useContext(AuthContext); 
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessage);
  const [input, setInput] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [context, setContext] = useState("Onboarding");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [error, setError] = useState<string | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    fetchMessages();
    scrollToBottom();
  }, [context]);
  
  useEffect(() => {
    if (editingMessageId === null) {
      scrollToBottom();
    }
  }, [messages, editingMessageId]);
  

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const getUsernameFromToken = (token: string): string | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      return parsed.sub;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };
  
  const getUsername = (): string => {
    const token = localStorage.getItem('token');
    if (token) {
      const username = getUsernameFromToken(token);
      return username || 'User';
    }
    return 'User';
  };
  
  const username = getUsername();
  
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
  
  // updated handleSend now fetching the updated messages after sending a message
  // room for optimization by reducing the number of API calls to return both the user/assistant's response in a single call, but currently leaving as is for UX reasons
  // for being able to see sent message immediately in the UI
  const handleSend = async () => {
    if (isSending) return; // Prevent multiple sends
    setIsSending(true);
    const trimmedInput = input.trim();
    if (trimmedInput) {
      // Create a temporary message object
      const tempMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        role: "user",
        content: trimmedInput,
        timestamp: new Date().toISOString(),
        user_id: user ? user.id : 0,
        context: context,
        isEditing: false,
        is_edited: false,  
        is_deleted: false
      };
  
      // Optimistically add the message to the UI
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setInput("");
  
      try {
        const newMessage = await sendMessage(trimmedInput, "user", context);
        // Replace the temporary message with the one from the server
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === tempMessage.id ? { ...newMessage, isEditing: false } : msg
          )
        );
        // Fetch messages to include assistant's response
        await fetchMessages();
      } catch (error) {
        console.error("Failed to send message:", error);
        // Remove the temporary message
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
        // Display error message
        setError("Failed to send message. Please try again.");
      } finally {
        setIsSending(false); // Reset isSending regardless of success or failure
      }
    } else {
      setIsSending(false); // Reset isSending if input is empty
    }
  };
 
    
    // Ensure only the most recent message can be edited
    const userMessages = messages.filter(
      msg => msg.role === 'user' && !msg.is_deleted && !msg.is_edited
    );
    const mostRecentMessage = userMessages[userMessages.length - 1];
    const mostRecentMessageId = mostRecentMessage ? mostRecentMessage.id : null;
    
   const handleEdit = (id: number) => {
    if (mostRecentMessageId && mostRecentMessageId === id) {
      setEditingMessageId(id);
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === id ? { ...message, isEditing: true } : message
        )
      );
    } else {
      setError("Only the most recent message can be edited.");
    }
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
        setIsSaving(true);
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
          // Refresh messages to reflect edited state
          await fetchMessages();
        }
      } catch (error) {
        console.error("Failed to update message:", error);
        setError("Failed to update message. Please try again.");
      }
      finally {
        setIsSaving(false); // End saving
      }
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      await deleteMessage(id);
      // Refresh messages to reflect deletion of both user message and assistant response
      await fetchMessages();
      setEditingMessageId(null);
  } catch (error) {
    console.error("Failed to delete message:", error);
    setError("Failed to delete message. Please try again.");
  }
};
  
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  
  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.checked ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = newTheme === "dark" ? "dark-theme" : "light-theme";
  };
  
  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as string);
  };
  
  const handleContextChange = (event: SelectChangeEvent) => {
    const newContext = event.target.value as string;
    setContext(newContext);
    fetchMessages();
  };
  
  const handleLogoutClick = () => {
    handleCloseMenu();
    logout();
  };
  
  const handleFeedbackClick = () => {
    window.open('https://www.artisan.co/contact-us', '_blank');
  };
  
  const handleSupportClick = () => {
    window.open('https://support.artisan.co/en/', '_blank');
  };
  
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
              className="action-button"
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

      <div className="chat-header-left">
        <Avatar
          src={
            context === "Onboarding"
              ? avatarImage
              : context === "Support"
              ? elijahAvatar
              : lucasAvatar
          }
          alt="Chatbot Avatar"
        />
        <div className="chatbot-info">
          <h4>
            Hey👋, I'm{" "}
            {context === "Onboarding"
              ? "Ava"
              : context === "Support"
              ? "Elijah"
              : "Lucas"}
          </h4>
          <p>Ask me anything or pick a place to start</p>
        </div>
      </div>

      <IconButton onClick={handleAvatarClick} className="user-avatar-button">
        <Avatar src={userAvatar} alt="User Avatar" />
      </IconButton>
    </div>

        {/* Profile Dropdown Menu */}
<Menu
  anchorEl={anchorEl}
  open={menuOpen}
  onClose={handleCloseMenu}
  anchorOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
  className="profile-dropdown" // Added className
>
  <MenuItem disabled className="profile-dropdown-item">
    <Typography variant="subtitle1">Hello, {username}</Typography>
  </MenuItem>
  {/* Other MenuItems */}
  <MenuItem onClick={handleFeedbackClick} className="profile-dropdown-item">
    <Tooltip title="Give Feedback">
      <Button startIcon={<FeedbackIcon />}>Feedback</Button>
    </Tooltip>
  </MenuItem>
  <MenuItem onClick={handleSupportClick} className="profile-dropdown-item">
    <Tooltip title="Get Support">
      <Button startIcon={<SupportAgentIcon />}>Support</Button>
    </Tooltip>
  </MenuItem>
  <MenuItem onClick={handleLogoutClick} className="profile-dropdown-item">
    <Tooltip title="Logout">
      <Button startIcon={<LogoutIcon />}>Logout</Button>
    </Tooltip>
  </MenuItem>
</Menu>

{/* Context Select Menu */}


      
      
      <div className="messages-container">
        {messages
        .filter(msg => !msg.is_deleted)
        .map((message) => (
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
                <Button onClick={() => saveEdit(message.id)} variant="contained" color="primary" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : null}>
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
    {message.id === mostRecentMessageId && (
      <IconButton onClick={() => handleEdit(message.id)} size="small">
        <EditIcon fontSize="small" />
      </IconButton>
    )}
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
            disabled={isSending}
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
            MenuProps={{
              classes: { paper: 'context-dropdown' }, // Added class to Menu
            }}
          >
            <MenuItem value="Onboarding">Onboarding</MenuItem>
            <MenuItem value="Support">Support</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
        </Select>

          
          <IconButton onClick={toggleSettings}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="primary" onClick={handleSend} disabled={isSending}>
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

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <Typography color="error">{error}</Typography>
        </div>
      )}
    </div>
  );
};
  
  export default ChatWindow;

