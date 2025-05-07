export function validateInput(inputString: string, inputType: 'phone' | 'email' | 'matric'): string {
    // Define regex patterns
    const patterns: { [key: string]: RegExp } = {
        phone: /^\+?1?\d{9,15}$/,  // Example for international phone numbers
        email: /^[a-zA-Z]+[0-9]{5}@run\.edu\.ng$/,  // Updated pattern for emails ending with @run.edu.ng
        matric: /^RUN\/[A-Z]{3}\/\d{2}\/\d{5}$/  // Updated pattern for matric numbers (e.g., RUN/CMP/21/10833)
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

