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
    'ERR_INTERNET_DISCONNECTED', 'ERR_NAME_NOT_RESOLVED', 'ERR_CONNECTION_TIMED_OUT',
    'ERR_CONNECTION_RESET', 'ERR_CONNECTION_REFUSED'
];
webview.addEventListener('did-fail-load', (error) => {
    console.error('Gagal memuat halaman:', error);
    if (networkErrorCodes.includes(error.code)) {
        webview.src = './offline.html';
    }
});

// --- Tombol Navigasi & Zoom ---
document.getElementById('btnHome').addEventListener('click', () => webview.src = examUrl);
document.getElementById('btnReload').addEventListener('click', () => webview.reload());
document.getElementById('btnZoomIn').addEventListener('click', () => webview.setZoomFactor(webview.getZoomFactor() + 0.1));
document.getElementById('btnZoomOut').addEventListener('click', () => {
    if (webview.getZoomFactor() > 0.25) webview.setZoomFactor(webview.getZoomFactor() - 0.1);
});
document.getElementById('btnResetZoom').addEventListener('click', () => webview.setZoomFactor(1.0));

// --- Logika Keluar dengan Modal HTML ---
const exitModal = document.getElementById('exitModalOverlay');
const passwordInput = document.getElementById('exitPasswordInput');
const btnConfirmExit = document.getElementById('btnConfirmExit');
const btnCancelExit = document.getElementById('btnCancelExit');

function showExitModal() {
    exitModal.classList.remove('hidden');
    passwordInput.focus();
}

function hideExitModal() {
    passwordInput.value = '';
    exitModal.classList.add('hidden');
}

btnConfirmExit.addEventListener('click', () => {
    if (passwordInput.value === exitPassword) {
        window.close(); // Perintah ini akan memicu event 'close' di main.js
    } else {
        alert('Password Keluar salah!');
        hideExitModal();
    }
});

btnCancelExit.addEventListener('click', hideExitModal);

// Panggil fungsi keluar saat tombol 'Keluar' di-klik
document.getElementById('btnClose').addEventListener('click', showExitModal);

// Panggil fungsi keluar yang sama saat Alt+F4 atau Command+Q ditekan
window.api.onTriggerExit(showExitModal);