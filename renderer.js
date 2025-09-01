const webview = document.getElementById('examWebview');
let examUrl = '';
let exitPassword = '';

window.api.onExamData(data => {
    examUrl = data.examUrl;
    exitPassword = data.exitPassword;
    webview.src = examUrl;
});

// --- Tombol Navigasi & Zoom --- (Tidak ada perubahan di sini)
document.getElementById('btnHome').addEventListener('click', () => webview.src = examUrl);
document.getElementById('btnReload').addEventListener('click', () => webview.reload());
document.getElementById('btnZoomIn').addEventListener('click', () => webview.setZoomFactor(webview.getZoomFactor() + 0.1));
document.getElementById('btnZoomOut').addEventListener('click', () => {
    if (webview.getZoomFactor() > 0.25) webview.setZoomFactor(webview.getZoomFactor() - 0.1);
});
document.getElementById('btnResetZoom').addEventListener('click', () => webview.setZoomFactor(1.0));

// --- Logika Keluar ---
document.getElementById('btnClose').addEventListener('click', () => {
    // Panggil dialog prompt yang aman dari main process
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
            // Pengguna menekan 'Cancel' atau 'Esc'
            console.log('Proses keluar dibatalkan.');
        } else if (inputPassword === exitPassword) {
            // Password benar, tutup aplikasi
            window.close();
        } else {
            // Password salah
            alert('Password Keluar salah!');
        }
    })
    .catch(console.error);
});