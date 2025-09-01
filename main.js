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
let isPromptOpen = false; // Penanda apakah dialog prompt sedang terbuka

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

    // PERBAIKAN UTAMA ADA DI SINI
    // Mencegat semua upaya untuk menutup jendela
    mainWindow.on('close', (event) => {
        // 1. Mencegah jendela agar tidak langsung tertutup
        event.preventDefault(); 
        
        // 2. Kirim pesan ke renderer untuk menampilkan prompt password
        //    Ini akan menangani Alt+F4, window.close(), dll.
        if (mainWindow) {
            mainWindow.webContents.send('trigger-exit-prompt');
        }
    });

    mainWindow.on('closed', () => { mainWindow = null; });

    mainWindow.on('blur', () => {
        if (mainWindow && !isPromptOpen) {
            mainWindow.focus();
        }
    });

    // Shortcut Alt+Tab tetap kita blokir
    globalShortcut.register('Alt+Tab', () => false);

    // Kita tidak lagi mendaftarkan Alt+F4 di sini karena sudah ditangani oleh event 'close'
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
        if (!mainWindow) app.quit();
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

ipcMain.handle('login-attempt', async (event, { sessionId, password }) => {
    if (!sessionId || !password) {
        return { success: false, message: 'Sesi ID dan Password wajib diisi.' };
    }
    try {
        const response = await axios.get(`${API_URL}?sesi=${sessionId}`);
        const data = response.data;
        if (data.status === 'success' && data.passMasuk == password) {
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

ipcMain.on('login-successful', (event, data) => {
    createMainWindow(data.url, data.exitPass);
    if (loginWindow) {
        loginWindow.close();
    }
});

// PERBAIKAN UTAMA: Gunakan 'async' dan 'await' agar benar-benar menunggu
ipcMain.handle('show-exit-prompt', async (event, options) => {
    isPromptOpen = true; // Set penanda
    try {
        const parentWindow = BrowserWindow.fromWebContents(event.sender);
        // Tunggu (await) sampai pengguna selesai berinteraksi dengan prompt
        const result = await prompt(options, parentWindow);
        return result;
    } finally {
        isPromptOpen = false; // Kembalikan penanda setelah prompt benar-benar selesai
    }
});