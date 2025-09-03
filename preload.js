const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    login: (sessionId, password) => ipcRenderer.invoke('login-attempt', { sessionId, password }),
    notifyLoginSuccess: (data) => ipcRenderer.send('login-successful', data),
    onExamData: (callback) => ipcRenderer.on('exam-data', (_event, value) => callback(value)),
    onTriggerExit: (callback) => ipcRenderer.on('trigger-exit-prompt', () => callback())
});