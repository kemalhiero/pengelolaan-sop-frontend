export default function switchStatus(number) {
    switch(number) {
        case 0: return "Tidak berlaku";
        case 1: return "Berlaku";
        case 2: return "Belum berlaku";
        default: return "Status tidak valid";
    }
};
