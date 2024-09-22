import React, { useState, useContext } from 'react';
import { login as loginApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import './Register.css';  

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Access login function from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const response = await loginApi(username, password);
      const { access_token } = response;
      await login(access_token); // Update context with token and fetch user data
      navigate('/'); // Redirect to home page after login
    } catch (error: any) {
      console.error('Error during login:', error);
      setError(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <Container maxWidth="lg" className="register-container"> 
      <Box className="register-box">
        
        <div className="register-right-column">
          {/* Add logo at the top */}
          <img 
            src="https://app.artisan.co/assets/artisan-logo-dc59576e.svg" 
            alt="Artisan Logo" 
            className="artisan-logo" 
          />
          <Typography variant="h4" align="center" className="text-primary">Login</Typography>
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
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleLogin}
              className="register-button"
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="text"
              color="secondary"
              onClick={() => navigate('/register')}
              style={{ marginTop: '8px' }}
            >
              Don't have an account? Register
            </Button>
          </Box>
        </div>
      </Box>
    </Container>
  );
};

export default Login;
