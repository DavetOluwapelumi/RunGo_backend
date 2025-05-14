function validateInput(inputString: string, inputType: 'phone' | 'email' | 'matric'): string {
    // Define regex patterns
    const patterns: { [key: string]: RegExp } = {
        phone: /^\+?1?\d{9,15}$/,  // Example for international phone numbers
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        matric: /^[A-Z]{3}\/[A-Z]{3}\/\d{2}\/\d{5}$/  // Updated pattern for matric numbers (e.g., RUN/CMP/21/10833)
    };

    // Check if the input type is valid
    if (!(inputType in patterns)) {
        return "Invalid input type. Please use 'phone', 'email', or 'matric'.";
    }

    // Match the input string against the corresponding regex pattern
    if (patterns[inputType].test(inputString)) {
        return `Valid ${inputType}: ${inputString}`;
    } else {
        return `Invalid ${inputType}: ${inputString}`;
    }
}

// Example usage
console.log(validateInput("+1234567890", "phone"));
console.log(validateInput("example@example.com", "email"));
console.log(validateInput("RUN/CMP/21/10833", "matric"));  // This will now be valid
