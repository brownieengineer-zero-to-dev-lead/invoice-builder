import { config } from 'dotenv';
import { app, BrowserWindow } from 'electron';
import { writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { APP_CONFIG } from './config';
import { initDBDialogsHandlers } from './ipc/dbDialogs';

config();

const log = (msg: string) => {
  try {
    writeFileSync(join(app.getPath('userData'), 'startup.log'), msg + '\n', { flag: 'a' });
  } catch {}
  console.log(msg);
};

const isDev = !app.isPackaged;
const devServer = APP_CONFIG.FE_SERVER_URL;
const dbName = APP_CONFIG.DB_NAME;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const preloadPath = isDev
  ? join(resolve(), 'dist-be/preload/preload.cjs')
  : join(__dirname, '../../preload/preload.cjs');
const indexHtmlPath = isDev ? devServer : join(__dirname, '../../../dist-fe/index.html');

log(`isPackaged: ${app.isPackaged}`);
log(`isDev: ${isDev}`);
log(`__dirname: ${__dirname}`);
log(`appPath: ${app.getAppPath()}`);
log(`preloadPath: ${preloadPath}`);
log(`indexHtmlPath: ${indexHtmlPath}`);

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    show: true,
    autoHideMenuBar: true,
    icon: join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    mainWindow.loadURL(devServer);
  } else {
    if (indexHtmlPath) mainWindow.loadFile(indexHtmlPath);
  }
  mainWindow.webContents.openDevTools();

  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.show();
  // });
};

app.whenReady().then(() => {
  createWindow();
  initDBDialogsHandlers(dbName, mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
