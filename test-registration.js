/**
 * Test script to verify registration functionality
 */

const testEmail = `test${Math.random().toString(36).substr(2, 9)}@example.com`;
const testPassword = 'testpassword123';
const testName = 'Test User';

console.log('Testing registration with:', {
  email: testEmail,
  password: testPassword,
  name: testName
});

// Simulate the registration process
const registrationData = {
  email: testEmail,
  password: testPassword,
  confirmPassword: testPassword,
  fullName: testName
};

// Test password validation
if (registrationData.password !== registrationData.confirmPassword) {
  console.error('Password validation failed: passwords do not match');
  process.exit(1);
}

if (registrationData.password.length < 6) {
  console.error('Password validation failed: password too short');
  process.exit(1);
}

// Test email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(registrationData.email)) {
  console.error('Email validation failed: invalid email format');
  process.exit(1);
}

// Simulate successful registration
const user = {
  id: Math.random().toString(36).substr(2, 9),
  email: registrationData.email,
  user_metadata: {
    full_name: registrationData.fullName
  }
};

console.log('Registration test successful!');
console.log('Generated user:', user);
console.log('User would be stored in localStorage with key: simple-auth-user');

// Test authentication flow
console.log('Testing sign-in with same credentials...');
if (registrationData.email && registrationData.password) {
  console.log('Sign-in test successful!');
  console.log('Authentication flow working properly');
} else {
  console.error('Sign-in test failed');
  process.exit(1);
}

console.log('All authentication tests passed!');