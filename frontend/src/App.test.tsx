import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';  // Adjust this path based on where your App.tsx is
import { AuthContext } from './context/AuthContext';  // Update this import path

const mockAuthContextValue = {
  user: { id: 1, username: 'testuser', email: 'test@example.com' },
  isAuthenticated: true,
  loading: false,  // Ensure loading is set to false to avoid loader issues
  login: jest.fn(),
  logout: jest.fn(),
  theme: 'light',
  setTheme: jest.fn(),
};

describe('App Component', () => {
  test('renders App component without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <App />
      </AuthContext.Provider>
    );

    // Ensure the "Type a message..." placeholder is found
    expect(screen.getByPlaceholderText(/Type a message.../i)).toBeInTheDocument();
  });
});
