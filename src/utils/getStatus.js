// secara umum hanya ada 3 status yang ada di dalam sistem ini, 
// yaitu aktif, tidak aktif, dan belum aktif
// tapi beberapa atribut ada penyesuaiannya masing-masing

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
        case 0: return "Batal";                 // batal atau emang ngga ada, default
        case 1: return "Diterima";              // sudah berlaku dan sudah dipublikasikan
        case 2: return "Sedang disusun oleh Penyusun";
        case 3: return "Sedang direview PJ";
        case 4: return "Perlu Revisi dari PJ";
        case 5: return "Sedang direview Kadep"; // sudah di asese pj
        case 6: return "Perlu Revisi dari Kadep";
        case 7: return "Sedang disahkan oleh Kadep"; // sudah di asese kadep
        default: return "Status tidak valid";
    }
};

export { switchStatusIsActive , switchStatusSopDetail };
