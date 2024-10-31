import { app, BrowserWindow, shell, ipcMain, nativeTheme } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import modules from '../DB/modules/index';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null;
let myWindow: any = null,
  myChildWindow: any = null;
let tray = null;
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');

// 创建主窗口
const createWindow = async (arg?: any) => {
  console.log(`argargargarg: ${arg}`);
  let res: any = arg || {};
  let params = '';
  try {
    res = JSON.parse(arg);
    params = Object.entries(res)
      ?.map?.((item: any) => {
        return `${item[0]}=${item[1]}`;
      })
      .join('&');
  } catch (err) { }
  const mainWindow: any = new BrowserWindow({
    width: !!params ? 1440 : 1280,
    height: !!params ? 900 : 810,
    minWidth: !!params ? 1080 : 1280,
    minHeight: !!params ? 700 : 810,
    type: `main-${res?.id}`,
    frame: false, // 隐藏窗口框架
    skipTaskbar: false, //是否在任务栏中显示窗口
    kiosk: false,
    // icon: getAssetPath('icon.png'),
    webPreferences: {
      preload,
      webSecurity: false, //网络安全，false允许访问本地文件
      nodeIntegration: true, // 是否集成Node
    },
  })

  // 最小化窗口
  ipcMain.handle(`minimize-${mainWindow.id}`, () => {
    mainWindow.minimize();
  });
  // 最大化/还原窗口
  ipcMain.handle(`maximize-${mainWindow.id}`, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });
  // 关闭窗口
  ipcMain.handle(`close-${mainWindow.id}`, (event: any, arg: any) => {
    if (arg) {
      myWindow = null;
      mainWindow?.close?.();
      mainWindow?.destroy?.();
    } else {
      mainWindow.minimize(); // 隐藏窗口而不是注销应用程序
    }
  });
  // 打开开发者工具
  ipcMain.handle(`openDevTools-${mainWindow.id}`, (args: any) => {
    mainWindow.webContents.openDevTools();
  });
  // 设置主题色
  ipcMain.handle(`theme-mode-${mainWindow.id}`, (event: any, arg: any) => {
    nativeTheme.themeSource = arg;
    return nativeTheme.shouldUseDarkColors;
  });
  // 获取主题色
  ipcMain.handle(`theme-get-${mainWindow.id}`, (event: any, arg: any) => {
    return nativeTheme.themeSource;
  });

  if (VITE_DEV_SERVER_URL) { // #298
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }: any) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(mainWindow)
}

app.whenReady().then(() => {
  // 添加到启动项目
  // app.setLoginItemSettings({
  //   openAtLogin: false,
  // });
  // if (!ifShellStartUp) {
  createWindow();
  modules.init(app);
  // }
  // trayFun();
})
  .catch(console.log);

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
