const { contextBridge, ipcRenderer } = require('electron');

// The screen picker window gets exactly two calls: list sources, choose one.
contextBridge.exposeInMainWorld('felexPicker', {
  sources: () => ipcRenderer.invoke('picker:sources'),
  choose: (id) => ipcRenderer.send('picker:choose', id),
});
