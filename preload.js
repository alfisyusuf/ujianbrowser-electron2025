const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    login: (sessionId, password) => ipcRenderer.invoke('login-attempt', { sessionId, password }),
    notifyLoginSuccess: (data) => ipcRenderer.send('login-successful', data),
    onExamData: (callback) => ipcRenderer.on('exam-data', (_event, value) => callback(value)),
    showExitPrompt: (options) => ipcRenderer.invoke('show-exit-prompt', options),

    // Fitur Baru: Tambahkan listener untuk pemicu dari Alt+F4
    onTriggerExit: (callback) => ipcRenderer.on('trigger-exit-prompt', () => callback())
});