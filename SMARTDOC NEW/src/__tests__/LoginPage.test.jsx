import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. Import the provider
import LoginPage from '../pages/LoginPage';

// Mocking useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mocking axios to prevent real network calls
jest.mock('axios');

// --- Test 1: Checks if the component renders ---
test('renders login page correctly', () => {
  render(
    // 2. Wrap the component with the provider for the test
    <GoogleOAuthProvider clientId="test-client-id">
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
  expect(screen.getByText(/Sign in to continue/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
});


// --- Test 2: Checks user interaction ---
test('allows user to type into email and password fields', () => {
  render(
    // 2. Wrap the component here as well
    <GoogleOAuthProvider clientId="test-client-id">
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  expect(emailInput.value).toBe('test@example.com');
  expect(passwordInput.value).toBe('password123');
});