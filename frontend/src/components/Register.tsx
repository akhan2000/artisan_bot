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
  // const [error, setError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  // Error state for handling validation errors
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  /**
   * Validates the form fields.
   * @returns {boolean} - Returns true if the form is valid, false otherwise.
   */
  const validate = (): boolean => {
    const newErrors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    // Username Validation
    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password Validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

        // Update validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Update the error state
    setErrors(newErrors);

    // Return true if no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the registration process.
   * Validates the form and submits the registration request.
   */
  const handleRegister = async () => {
    // Prevent submission if validation fails
    if (!validate()) {
      return;
    }

    try {
      // Call the registration API
      const response = await registerApi(username, password, email, firstName, lastName);
      
      // Destructure the access token from the response
      const { access_token } = response;
      
      // Log the user in by storing the token
      login(access_token);
      
      // Redirect the user to the chatbot
      navigate('/');
    } catch (error: any) {
      console.error('Error during registration:', error);
      
      // Update the general error state with the server's error message or a default message
      setErrors({
        ...errors,
        general: error.response?.data?.detail || 'Registration failed. Please try again.',
      });
    }
  };

  /**
   * Determines if the form can be submitted based on validation criteria.
   * @returns {boolean} - Returns true if the form is valid, false otherwise.
   */
  const isFormValid = () => {
    return (
      username.trim().length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      password.length >= 6 &&
      confirmPassword === password
    );
  };

  return (
    <Container maxWidth="lg" className="register-container">
      <Box className="register-box">
        <div className="register-left-column">
          <div className="register-image" />
        </div>
        <div className="register-right-column">
          {/* Form Title */}
          <Typography variant="h4" align="center" className="text-primary">Register</Typography>
          
          {/* Display General Errors */}
          {errors.general && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {errors.general}
            </Typography>
          )}

          <Box mt={2}>
            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onBlur={() => validate()} // Trigger validation on blur
              margin="normal"
              required
              error={Boolean(errors.username)}
              helperText={errors.username}
            />


            {/* Email Field */}
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => validate()}
              type="email"
              margin="normal"
              required
              error={Boolean(errors.email)}
              helperText={errors.email}
            />


            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => validate()}
              type="password"
              margin="normal"
              required
              error={Boolean(errors.password)}
              helperText={errors.password}
            />


            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onBlur={() => validate()}
              type="password"
              margin="normal"
              required
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
            />


            {/* First Name Field (Optional) */}
            <TextField
              fullWidth
              label="First Name (optional)"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              margin="normal"
            />

            {/* Last Name Field (Optional) */}
            <TextField
              fullWidth
              label="Last Name (optional)"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              margin="normal"
            />

            {/* Register Button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleRegister}
              className="register-button"
              disabled={!isFormValid()}
              sx={{ mt: 2 }}
            >
              Register
            </Button>
          </Box>

          {/* Login Prompt */}
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
              sx={{ mt: 1 }}
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


//   const handleRegister = async () => {
//     // UI Validation for Email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     try {
//       const response = await registerApi(username, password, email, firstName, lastName);
//       const { access_token } = response;
//       login(access_token); // Store token in context and localStorage
//       navigate('/'); // Redirect directly to the chatbot
//     } catch (error: any) {
//       console.error('Error during registration:', error);
//       setError(error.response?.data?.detail || 'Registration failed. Please try again.');
//     }
//   };

//   return (
//     <Container maxWidth="lg" className="register-container">
//       <Box className="register-box">
//         <div className="register-left-column">
//           <div className="register-image" />
//         </div>
//         <div className="register-right-column">
//           <Typography variant="h4" align="center" className="text-primary">Register</Typography>
//           {error && <Typography color="error">{error}</Typography>}
//           <Box mt={2}>
//             <TextField
//               fullWidth
//               label="Username"
//               value={username}
//               onChange={e => setUsername(e.target.value)}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Email"
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               type="email"
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Password"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               type="password"
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="First Name (optional)"
//               value={firstName}
//               onChange={e => setFirstName(e.target.value)}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Last Name (optional)"
//               value={lastName}
//               onChange={e => setLastName(e.target.value)}
//               margin="normal"
//             />
//             <Button
//               fullWidth
//               variant="contained"
//               color="primary"
//               onClick={handleRegister}
//               className="register-button"
//             >
//               Register
//             </Button>
//           </Box>
//           {/* Added Login Button Below */}
//           <Box mt={2}>
//             <Typography variant="body2" align="center">
//               Already have an account?
//             </Typography>
//             <Button
//               fullWidth
//               variant="text"
//               color="secondary"
//               onClick={() => navigate('/login')}
//               className="login-button"
//               style={{ marginTop: '8px' }}
//             >
//               Login
//             </Button>
//           </Box>
//         </div>
//       </Box>
//     </Container>
//   );
// };

// export default Register;

