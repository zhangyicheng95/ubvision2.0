import { app, BrowserWindow, shell, ipcMain, nativeTheme, IpcMainEvent, Notification } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs';
import { update } from './update'
import modules from '../DB/modules/index';
import { exec } from 'child_process';
import { networkInterfaces } from 'os';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '../..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
};
/**
 *  获取硬盘编码
 **/
function getDiskSerialNumber() {
  if (process.platform === 'win32') {
    // windows
    return new Promise((resolve, reject) => {
      exec('wmic diskdrive get serialnumber', (error: any, stdout: any, stderr: any) => {
        if (error) {
          return reject(error);
        }
        const lines = stdout.trim().split('\n');
        const serialNumbers = lines.slice(1).map((line: string) => line.trim());
        resolve(serialNumbers);
      });
    });
  } else {
    // macOS
    return new Promise((resolve, reject) => {
      exec('ioreg -rd1 -c AppleAHCIDevice', (error: any, stdout: any, stderr: any) => {
        if (error) {
          return reject(error);
        }
        const regex = /"Serial Number" = "([^"]+)"/g;
        const serialNumbers = [];
        let match;
        while (match = regex.exec(stdout)) {
          serialNumbers.push(match[1]);
        }
        resolve(serialNumbers);
      });
    });
  }
};
/**
 * 获取主板序列号
 */
function getMotherboardSerialNumber() {
  if (process.platform === 'win32') {
    // windows
    return new Promise((resolve, reject) => {
      exec('wmic baseboard get product,serialnumber', (error: any, stdout: any, stderr: any) => {
        if (error) {
          return reject(error);
        }
        const lines = stdout.trim().split('\n');
        const [_, product, serialNumber] = lines[1].split(/\s{2,}/);
        resolve({ product, serialNumber });
      });
    });
  } else {
    // macOS
    return new Promise((resolve, reject) => {
      exec('ioreg -rd1 -c IOPlatformExpertDevice', (error: any, stdout: any, stderr: any) => {
        if (error) {
          return reject(error);
        }
        const serialNumber = stdout.match(/"IOPlatformSerialNumber" = "([^"]+)"/)[1];
        resolve(serialNumber);
      });
    });
  }
};
/**
 * 获取MAC地址
 */
function getMACAddresses() {
  const nets: any = networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.mac);
      }
    }
  }
  return results;
}
ipcMain.on('hostname-read', async (event: IpcMainEvent, arg: string) => {
  // 同步获取机器ID
  getDiskSerialNumber().then(serialNumbers => {
    getMotherboardSerialNumber().then(serialNumber => {
      const macAddresses = getMACAddresses();
      event.sender.send('hostname-read-reply', `${serialNumbers}.${serialNumber}.${macAddresses}`);
    }).catch(error => {
      console.error(error);
    });
  }).catch(error => {
    console.error(error);
  });

});
// 读取快速启动列表
ipcMain.on('alert-read-startUp', async (event: IpcMainEvent, arg: string) => {
  console.log(`alert-read-startUp: ${arg}`);
  // 处理传递的参数
  let res: any = arg;
  try {
    res = JSON.parse(arg);
  } catch (err) { }
  // 快捷方式放在哪，名称
  const shortcutPath = path.join(
    app.getPath('appData'),
    `\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\${res?.name ? res.name : 'myubvision.lnk'
    }`
  );
  if (process.platform === 'win32') {
    const detail = shell.readShortcutLink(shortcutPath);
    event.sender.send('alert-read-startUp-reply', {
      success: !!detail?.target || !!detail?.cwd,
      id: res.id,
    });
  }
});
// 从快速启动列表删除项目
ipcMain.on('alert-delete-startUp', async (event: IpcMainEvent, arg: string) => {
  console.log(`alert-delete-startUp: ${arg}`);
  // 处理传递的参数
  let res: any = arg;
  try {
    res = JSON.parse(arg);
  } catch (err) { }
  // 快捷方式放在哪，名称
  const shortcutPath = path.join(
    app.getPath('appData'),
    `\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\${res?.name ? res.name : 'myubvision.lnk'
    }`
  );
  if (process.platform === 'win32') {
    shell.trashItem(shortcutPath);
    // 创建完成后，返回结果
    event.sender.send('alert-read-startUp-reply', {
      success: false,
      id: res.id,
    });
  }
});
// 打开第三方软件窗口
ipcMain.on(`startup-software`, (event: any, arg: any) => {
  console.log(`startup-software: ${arg}`);
  // 调用第三方客户端软件，例如记事本
  shell.openPath(arg).then(response => {
    if (response) {
      console.error(`Failed to open ${arg}: ${response}`);
    } else {
      console.log(`${arg} opened successfully`);
    }
  }).catch(err => {
    console.error(`catch failed to open ${arg}: ${err}`);
  });
});
// 执行cmd命令
ipcMain.on(`shell-cmd`, (event: any, arg: any) => {
  console.log(`shell-cmd: ${JSON.stringify(arg)}`);
  exec(arg, (error, stdout, stderr) => {
    if (error) {
      console.log(`执行命令时出错: ${error}`);
      return;
    }
    console.log(`命令输出: ${stdout}`);
  });
});
// 弹出系统通知
ipcMain.on(`system-notification`, (event: any, arg: any) => {
  console.log(`args: ${arg}`);
  const res = JSON.parse(arg);
  // 检查是否支持，Notification.isSupported()
  if (Notification.isSupported()) {
    console.log(`支持 Notification`);
    const notification = new Notification({
      title: res?.title,
      body: res?.body,
      silent: true, // 系统默认的通知声音
    });
    notification.on('failed', (event, err) => {
      console.log(`event:${JSON.stringify(event)}\nerr:${err}`);
    });
    notification.show();
  } else {
    console.log(`不支持 Notification`);
  }
});
// 读取文件内容
ipcMain.on('read-file-content', (event: any, arg: any) => {
  console.log(`read-file-content: ${arg}`);
  const path = JSON.parse(arg);
  fs.readFile(path, { encoding: 'utf-8' }, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
      event.sender.send('read-file-content-reply', JSON.stringify(res));
    }
  });
});

let win: BrowserWindow | null = null;
let myWindow: any = null,
  myChildWindow: any = null;
let tray = null;
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');

// 创建主窗口
const createWindow = async (arg?: any) => {
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
// 崩溃报告
const homeDir = os.homedir();
const logPath = path.join(homeDir, 'app.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
if (app.isPackaged) {
  console.log = (message) => {
    logStream.write(`${new Date()} ${message}\n`);
  };
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
