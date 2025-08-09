export const isValidUsername = (username: string): boolean => {
  /**
   * Validates a username string based on the following rules:
   * - Must be between 3 to 20 characters
   * - Must start with a letter (a–z, A–Z)
   * - Can contain letters, digits, underscores (_), and dots (.)
   * - Cannot contain consecutive dots or underscores
   * - Must end with a letter or digit
   */
  const usernameRegex =
    /^(?=.{3,20}$)(?!.*[._]{2})[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/;
  return usernameRegex.test(username);
};

export const isValidEmail = (email: string): boolean => {
  // Standard email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Validates coordinates
export const validateCoordinates = (lat: number, lon: number): boolean =>
  lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
