const sessionIdInput = document.getElementById('sessionId');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('btnLogin');
const statusDiv = document.getElementById('status');

loginButton.addEventListener('click', async () => {
    statusDiv.textContent = 'Memverifikasi...';
    loginButton.disabled = true;
    
    // 1. Minta verifikasi ke main process
    const result = await window.api.login(sessionIdInput.value, passwordInput.value);
    
    // 2. Cek hasilnya
    if (result.success) {
        // 3. JIKA SUKSES, beri perintah baru untuk ganti jendela
        statusDiv.textContent = 'Login Berhasil!';
        window.api.notifyLoginSuccess(result);
    } else {
        // Jika GAGAL, tampilkan pesan error
        statusDiv.textContent = result.message;
        loginButton.disabled = false;
    }
});