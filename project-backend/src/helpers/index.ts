// Helper file for authenticating users password

// Function to generate a random string
export const generateRandomString = (): string => {
    return Math.random().toString(36).substring(2);
}

// Function to hash a password using a salt
export const hashPassword = (salt: string, password: string): string => {
    return salt + password;
}