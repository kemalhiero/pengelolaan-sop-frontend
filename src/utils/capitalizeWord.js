/**
 * Capitalizes the first letter of each word in a given string.
 *
 * This function splits the provided text by spaces, then transforms each word so that its 
 * first character is uppercase and the remaining characters are lowercase. It returns an empty
 * string if the input is falsy.
 *
 * @param {string} text - The string to be processed.
 * @returns {string} The input string with each word's first letter capitalized.
 */
const capitalizeWords = (text) => {
    if (!text) return '';
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export default capitalizeWords;
