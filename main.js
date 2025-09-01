const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const prompt = require('electron-prompt');

// --- Konfigurasi (Tetap Sama) ---
const API_URL = "https://script.google.com/macros/s/AKfycbyShnlKToJWYN-y8FBazBYAOOzT4MJavo7w4uRMwFzXV-hTSJcqhLrTIgxsC8cbb_VDDQ/exec";
const MASTER_PASSWORD_MASUK = "FisikaJuara";
const MASTER_PASSWORD_KELUAR = "FisikaJuara";
const URL_DARURAT = "https://bing.com";

let mainWindow;
let loginWindow;

function createMainWindow(examUrl, exitPassword) {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        kiosk: true,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.removeMenu();

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('exam-data', { examUrl, exitPassword });
    });

    mainWindow.on('closed', () => { mainWindow = null; });

    // PERBAIKAN: Paksa aplikasi untuk merebut kembali fokus saat ditinggalkan
    mainWindow.on('blur', () => {
        if (mainWindow) {
            mainWindow.focus();
        }
    });

    // Kunci fokus agresif HANYA untuk Linux
    //if (process.platform === 'linux') {
    //    mainWindow.on('blur', () => {
    //        if (mainWindow) {
    //            mainWindow.focus();
    //        }
    //    });
    //}

    globalShortcut.register('Alt+Tab', () => false);
    //globalShortcut.register('Super', () => false);
}

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 500,
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    loginWindow.loadFile('login.html');
    loginWindow.removeMenu();
    loginWindow.on('closed', () => {
        // Jika jendela login ditutup & jendela utama tidak ada, maka tutup aplikasi
        if (!mainWindow) {
            app.quit();
        }
        loginWindow = null;
    });
}

app.whenReady().then(() => {
    createLoginWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// PERUBAHAN #1: Handler ini sekarang HANYA verifikasi dan mengembalikan data.
ipcMain.handle('login-attempt', async (event, { sessionId, password }) => {
    if (!sessionId || !password) {
        return { success: false, message: 'Sesi ID dan Password wajib diisi.' };
    }
    try {
        const response = await axios.get(`${API_URL}?sesi=${sessionId}`);
        const data = response.data;
        if (data.status === 'success' && data.passMasuk == password) {
            // JANGAN buat/tutup jendela di sini. Cukup kembalikan datanya.
            return { success: true, url: data.url, exitPass: data.passKeluar };
        }
        return { success: false, message: data.message || 'Password atau Sesi ID salah.' };
    } catch (error) {
        if (password === MASTER_PASSWORD_MASUK) {
            return { success: true, url: URL_DARURAT, exitPass: MASTER_PASSWORD_KELUAR };
        }
        return { success: false, message: 'Koneksi ke server gagal. Periksa internet Anda.' };
    }
});

// PERUBAHAN #2: Handler BARU untuk manajemen jendela setelah login sukses.
ipcMain.on('login-successful', (event, data) => {
    createMainWindow(data.url, data.exitPass);
    if (loginWindow) {
        loginWindow.close();
    }
});

// Handler untuk prompt keluar (tetap sama)
ipcMain.handle('show-exit-prompt', (event, options) => {
    return prompt(options, BrowserWindow.fromWebContents(event.sender));
});