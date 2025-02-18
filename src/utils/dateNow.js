/**
 * Formats the current date as a string in the format "dd/mm/yyyy".
 *
 * @returns {string} The formatted date string.
 */
export default function formatTanggalHariIni() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
}
