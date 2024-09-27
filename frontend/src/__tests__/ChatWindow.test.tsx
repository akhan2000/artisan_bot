import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

jest.mock('axios'); // Mock axios

describe('ChatWindow Component', () => {
  const mockSendMessage = axios.post as jest.Mock;
  const mockGetMessages = axios.get as jest.Mock;

  const user = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockAuthContextValue = {
    user,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    theme: 'light',
    setTheme: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getMessages to return an empty array initially
    mockGetMessages.mockResolvedValue({
      data: [],
    });

    // Mock sendMessage to return a message
    mockSendMessage.mockResolvedValue({
      data: {
        id: Date.now(), // Temporary ID
        role: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString(),
        user_id: user.id,
        context: 'Onboarding',
        is_edited: false,
        is_deleted: false,
      },
    });

    // Mock getMessages to return user message and assistant response
    mockGetMessages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          role: 'user',
          content: 'Test message',
          timestamp: new Date().toISOString(),
          user_id: user.id,
          context: 'Onboarding',
        },
        {
          id: 2,
          role: 'assistant',
          content: 'AI Response',
          timestamp: new Date().toISOString(),
          user_id: 0,
          context: 'Onboarding',
        },
      ],
    });
  });

  test('sends a message and fetches API response', async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={mockAuthContextValue}>
          <ChatWindow />
        </AuthContext.Provider>
      );
    });

    // Find the input field and simulate typing
    const input = screen.getByPlaceholderText(/Type a message.../i);
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Simulate clicking the send button
    const sendButton = screen.getByLabelText(/Send message/i);
    await act(async () => {
      fireEvent.click(sendButton);
    });

    // Ensure sendMessage API is called
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        'http://localhost:8000/messages/', // URL
        { content: 'Test message', role: 'user', context: 'Onboarding' }, // Payload
        { headers: { 'Content-Type': 'application/json' } } // Headers
      );
    });

    // Ensure getMessages API is called to fetch the response
    await waitFor(() => {
      expect(mockGetMessages).toHaveBeenCalled();
    });
  });
});
