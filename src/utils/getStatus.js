// secara umum hanya ada 3 status yang ada di dalam sistem ini, 
// yaitu aktif, tidak aktif, dan belum aktif
// tapi beberapa atribut ada penyesuaiannya masing-masing

import statusTexts from '@/data/statusTexts.json';

const switchStatusIsActive = (number) => {
    return statusTexts.isActive[number] || "Status tidak valid";
};

const switchStatusSopDetail = (number) => {
    return statusTexts.sopDetail[number] || "Status tidak valid";
};

export { switchStatusIsActive, switchStatusSopDetail };
