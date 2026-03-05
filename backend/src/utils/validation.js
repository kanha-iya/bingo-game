// Email validation regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function wrapper (cleaner usage)
export const isValidEmail = (email) => {
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password.length >= 6;
};

export const isValidUsername = (username) => {
  return username.length >= 3 && username.length <= 20;
};