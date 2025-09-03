const webview = document.getElementById('examWebview');
let examUrl = '';
let exitPassword = '';

window.api.onExamData(data => {
    examUrl = data.examUrl;
    exitPassword = data.exitPassword;
    webview.src = examUrl;
});

// --- PENDETEKSI KONEKSI GAGAL ---
const networkErrorCodes = [
    'ERR_INTERNET_DISCONNECTED',
    'ERR_NAME_NOT_RESOLVED',
    'ERR_CONNECTION_TIMED_OUT',
    'ERR_CONNECTION_RESET',
    'ERR_CONNECTION_REFUSED'
];

webview.addEventListener('did-fail-load', (error) => {
    console.error('Gagal memuat halaman:', error);
    // Cek jika error termasuk dalam daftar error jaringan
    if (networkErrorCodes.includes(error.code)) {
        // Alihkan ke halaman offline kustom kita
        webview.src = './offline.html';
    }
});
// --- AKHIR DARI PENDETEKSI KONEKSI GAGAL ---


// --- Tombol Navigasi & Zoom ---
document.getElementById('btnHome').addEventListener('click', () => webview.src = examUrl);
document.getElementById('btnReload').addEventListener('click', () => webview.reload());
document.getElementById('btnZoomIn').addEventListener('click', () => webview.setZoomFactor(webview.getZoomFactor() + 0.1));
document.getElementById('btnZoomOut').addEventListener('click', () => {
    if (webview.getZoomFactor() > 0.25) webview.setZoomFactor(webview.getZoomFactor() - 0.1);
});
document.getElementById('btnResetZoom').addEventListener('click', () => webview.setZoomFactor(1.0));

// --- Logika Keluar ---
document.getElementById('btnClose').addEventListener('click', () => {
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
            window.close();
        } else {
            alert('Password Keluar salah!');
        }
    })
    .catch(console.error);
});

window.api.onTriggerExit( () => {
    document.getElementById('btnClose').click();
});