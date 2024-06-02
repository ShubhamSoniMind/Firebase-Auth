// utils/validationUtils.js

// Email validation function
export const isValidEmail = email => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

// Age validation function
export const isValidAge = age => {
  const parsedAge = parseInt(age, 10);
  return !isNaN(parsedAge) && parsedAge > 0;
};
