const switchStatusIsActive = (number) => {
    switch(number) {
        case 0: return "Tidak berlaku";
        case 1: return "Berlaku";
        case 2: return "Belum berlaku";
        default: return "Status tidak valid";
    }
};

const switchStatusSopDetail = (number) => {
    switch(number) {
        case 0: return "Batal";
        case 1: return "Diterima";
        case 2: return "Belum berlaku";
        default: return "Status tidak valid";
    }
};

export { switchStatusIsActive , switchStatusSopDetail };
