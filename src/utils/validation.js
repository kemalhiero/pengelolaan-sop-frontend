/**
 * Validates whether the given text begins with an alphabetical character (A-Z or a-z).
 *
 * @param {string} text - The text to validate.
 * @returns {boolean} True if the text starts with a letter, false otherwise.
 */
const validateText = (text) => {
    const regex = /^[^a-zA-Z]/;
    return !regex.test(text);
};

export { validateText };
