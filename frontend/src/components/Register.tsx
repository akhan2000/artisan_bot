// src/components/Register.tsx

import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Optional fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      await register(username, password, email, firstName, lastName);
      // Registration successful, redirect to login page
      navigate('/login'); // Could auto log in and send straight to bot, or prompt user to log in again as is set up currently
    } catch (error: any) {
      console.error('Error during registration:', error);
      setError(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" align="center">Register</Typography>
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
          {/* Optional fields */}
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
            style={{ marginTop: '16px' }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
