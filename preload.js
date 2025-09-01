const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    login: (sessionId, password) => ipcRenderer.invoke('login-attempt', { sessionId, password }),
    
    // PERUBAHAN: Fungsi baru untuk memberitahu main process bahwa login SUKSES.
    notifyLoginSuccess: (data) => ipcRenderer.send('login-successful', data),
    
    onExamData: (callback) => ipcRenderer.on('exam-data', (_event, value) => callback(value)),
    showExitPrompt: (options) => ipcRenderer.invoke('show-exit-prompt', options)
});