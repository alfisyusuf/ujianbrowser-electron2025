const webview = document.getElementById('examWebview');
const btnClose = document.getElementById('btnClose');
let examUrl = '';
let exitPassword = '';

window.api.onExamData(data => {
    examUrl = data.examUrl;
    exitPassword = data.exitPassword;
    webview.src = examUrl;
});

// --- Tombol Navigasi & Zoom ---
document.getElementById('btnHome').addEventListener('click', () => webview.src = examUrl);
document.getElementById('btnReload').addEventListener('click', () => webview.reload());
document.getElementById('btnZoomIn').addEventListener('click', () => webview.setZoomFactor(webview.getZoomFactor() + 0.1));
document.getElementById('btnZoomOut').addEventListener('click', () => {
    if (webview.getZoomFactor() > 0.25) webview.setZoomFactor(webview.getZoomFactor() - 0.1);
});
document.getElementById('btnResetZoom').addEventListener('click', () => webview.setZoomFactor(1.0));

// --- Logika Keluar ---

// Buat satu fungsi agar bisa dipanggil dari dua tempat
function attemptExitProcess() {
    window.api.showExitPrompt({
        title: 'Konfirmasi Keluar',
        label: 'Masukkan Password Keluar:',
        value: '',
        inputAttrs: {
            type: 'password'
        },
        type: 'input'
    })
    .then((inputPassword) => {
        if (inputPassword === null) {
            console.log('Proses keluar dibatalkan.');
        } else if (inputPassword === exitPassword) {
            window.close(); // Perintah ini akan menutup aplikasi
        } else {
            alert('Password Keluar salah!');
        }
    })
    .catch(console.error);
}

// Panggil fungsi keluar saat tombol 'Keluar' di-klik
btnClose.addEventListener('click', attemptExitProcess);

// Panggil fungsi keluar yang sama saat Alt+F4 ditekan
window.api.onTriggerExit(attemptExitProcess);