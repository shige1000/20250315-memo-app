const { app, BrowserWindow, Menu } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 550,
        height: 500,
        alwaysOnTop: true, // 常に最前面に表示
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // メニューバーを削除
    Menu.setApplicationMenu(null);

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);
