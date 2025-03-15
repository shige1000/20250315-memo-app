const { app, BrowserWindow, Menu } = require('electron');

// ウィンドウ設定のデフォルト値
const DEFAULT_WINDOW_CONFIG = {
    width: 550,
    height: 500,
    alwaysOnTop: true,
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
        webSecurity: true
    }
};

// CSPヘッダーの設定
const CSP_HEADER = {
    'Content-Security-Policy': ["default-src 'self'"]
};

// メインウィンドウを作成する関数
function createWindow() {
    const win = new BrowserWindow(DEFAULT_WINDOW_CONFIG);

    // メニューバーを削除
    Menu.setApplicationMenu(null);

    // CSPを設定
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                ...CSP_HEADER
            }
        });
    });

    win.loadFile('index.html');
}

// アプリケーションの準備完了時にウィンドウを作成
app.whenReady().then(createWindow);
