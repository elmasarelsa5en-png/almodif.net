const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'نظام المضيف الذكي - Smart Host System',
    icon: path.join(__dirname, 'public', 'app-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    backgroundColor: '#1a1b26',
    autoHideMenuBar: true,
    show: false
  });

  // في وضع التطوير، نفتح localhost:3000
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    // فتح DevTools في وضع التطوير
    mainWindow.webContents.openDevTools();
  } else {
    // في الإنتاج، نفتح الملفات المبنية
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  }

  // إظهار النافذة عند الجاهزية
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
