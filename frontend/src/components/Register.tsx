import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import './Register.css';  // Add a custom CSS file to manage specific styles

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      await register(username, password, email, firstName, lastName);
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error: any) {
      console.error('Error during registration:', error);
      setError(error.response?.data?.detail || 'Registration failed');
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
        </div>
      </Box>
    </Container>
  );
};

export default Register;
