// src/components/Register.tsx

import React, { useState,useContext  } from 'react';
import { register as registerApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import './Register.css';  // Ensure this CSS file exists and is correctly styled

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    // UI Validation for Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await registerApi(username, password, email, firstName, lastName);
      const { access_token } = response;
      login(access_token); // Store token in context and localStorage
      navigate('/'); // Redirect directly to the chatbot
    } catch (error: any) {
      console.error('Error during registration:', error);
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" className="register-container">
      <Box className="register-box">
        <div className="register-left-column">
          <div className="register-image" />
        </div>
        <div className="register-right-column">
          <Typography variant="h4" align="center" className="text-primary">Register</Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Box mt={2}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              margin="normal"
            />
            <TextField
              fullWidth
              label="First Name (optional)"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name (optional)"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleRegister}
              className="register-button"
            >
              Register
            </Button>
          </Box>
          {/* Added Login Button Below */}
          <Box mt={2}>
            <Typography variant="body2" align="center">
              Already have an account?
            </Typography>
            <Button
              fullWidth
              variant="text"
              color="secondary"
              onClick={() => navigate('/login')}
              className="login-button"
              style={{ marginTop: '8px' }}
            >
              Login
            </Button>
          </Box>
        </div>
      </Box>
    </Container>
  );
};

export default Register;

