import {
  app, BrowserWindow, shell, ipcMain, nativeTheme, IpcMainEvent, Notification, dialog
} from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { update } from './update';
import modules from '../DB/modules/index';
import { exec } from 'child_process';
import { networkInterfaces } from 'os';
import { resolveHtmlPath } from './util';
import writeShortcutLink from 'windows-shortcuts';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '../..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL; //process.env.VITE_DEV_SERVER_URL;  resolveHtmlPath('index.html');

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
        const lines = stdout.trim().split('\n');
        const [product, serialNumber] = lines[1].split(/\s{2,}/);
        resolve(serialNumber);
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
  // 硬盘编码
  getDiskSerialNumber().then(serialNumbers => {
    // 主板序列号
    getMotherboardSerialNumber().then(serialNumber => {
      // MAC地址
      const macAddresses = getMACAddresses();
      event.sender.send('hostname-read-reply', `${serialNumbers}${serialNumber}.${macAddresses}`);
    }).catch(error => {
      console.error(error);
    });
  }).catch(error => {
    console.error(error);
  });

});
// 打开多窗口
ipcMain.on('alert-open-browser', async (event: IpcMainEvent, arg: string) => {
  const data = JSON.parse(arg);
  createWindow(JSON.stringify(data));
});
const readPathDir = (event: any) => {
  const fastPath = path.join(
    app.getPath('appData'),
    `\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\`
  );
  fs.readdir(fastPath, (err, files) => {
    if (err) {
      console.error(`无法读取快速启动目录:${err}`);
      event.sender.send('alert-read-startUp-reply', { err });
      return;
    };
    event.sender.send('alert-read-startUp-reply', { files });
  });
};
// 添加桌面快捷方式
ipcMain.on('alert-make-browser', async (event: IpcMainEvent, arg: string) => {
  // 处理传递的参数
  let res: any = arg;
  try {
    res = JSON.parse(arg);
  } catch (err) { }
  const shortcutPath = path.join(
    app.getPath('desktop'),
    res?.name ? res.name : 'myubvision.lnk'
  );
  const targetPath = res?.id ? `myubvision:?id=${res.id}` : process.execPath;
  // @ts-ignore
  writeShortcutLink.create(shortcutPath, {
    target: targetPath,
    cwd: process.cwd(), // 工作目录
    desc: '', // 快捷方式描述
    icon: path.join(__dirname, '../../../public/sany.ico'), // 快捷方式图标
  }, function (err) {
    if (err) {
      console.error('快捷方式创建失败:', err);
    } else {
      console.log('快捷方式创建成功:', shortcutPath);
    }
  });
});
// 读取快速启动列表
ipcMain.on('alert-read-startUp', async (event: IpcMainEvent, arg?: any) => readPathDir(event));
// 添加项目到快速启动列表
ipcMain.on('alert-add-startUp', async (event: IpcMainEvent, arg: string) => {
  console.log(`alert-add-startUp: ${arg}`);
  // 处理传递的参数
  let res: any = arg;
  try {
    res = JSON.parse(arg);
  } catch (err) { }
  // 快捷方式放在哪，名称
  const shortcutPath = path.join(
    app.getPath('appData'),
    `\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\${res?.name ? res.name : 'myubvision.lnk'}`
  );
  console.log(`添加的目标路径:${shortcutPath}`);
  const targetPath = res?.id ? `myubvision:?id=${res.id}` : process.execPath;
  // @ts-ignore
  writeShortcutLink.create(shortcutPath, {
    target: targetPath,
    cwd: process.cwd(), // 工作目录
    desc: '', // 快捷方式描述
    icon: path.join(__dirname, '../../../public/sany.ico'), // 快捷方式图标
  }, function (err) {
    if (err) {
      console.error('快捷方式创建失败:', err);
    } else {
      console.log('快捷方式创建成功:', shortcutPath);
      // 创建完成后，返回结果
      readPathDir(event);
    }
  });
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
    `\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\${res?.name ? res.name : 'myubvision.lnk'}`
  );
  shell.trashItem(shortcutPath).then(() => {
    // 删除完成后，返回结果
    readPathDir(event);
  });
});
// 监听readFile，接收渲染进程发送的消息
ipcMain.on('resource-file-read', async (event: IpcMainEvent, arg: string) => {
  fs.readFile(arg, 'utf-8', (err, data) => {
    if (err) {
      event.sender.send('resource-file-read-reply', 'error');
    } else {
      event.sender.send('resource-file-read-reply', data);
    }
  });
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
      console.log(`event:${JSON.stringify(event)} \nerr:${err}`);
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
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');
// 检测当前点击的窗口，是否已打开
function toggleAlwaysOnTop(type: string) {
  const windows = BrowserWindow.getAllWindows();
  let window: any = null;
  windows.forEach((item: any) => {
    item.setAlwaysOnTop(false);
    if (!!type && type === item.customType) {
      window = item;
    }
  });
  return window;
};

// 创建主窗口
const createWindow = async (arg?: any) => {
  console.log(`argargarg:${arg}`);
  let res: any = arg || { id: 1 };
  let params = '';
  try {
    res = JSON.parse(arg);
    params = Object.entries(res)
      ?.map?.((item: any) => {
        return `${item[0]}=${item[1]}`;
      })
      .join('&');
  } catch (err) { }
  const mainsWindow = toggleAlwaysOnTop(`main-${res?.id}`);
  if (!!mainsWindow) {
    if (mainsWindow?.isMinimized?.()) {
      mainsWindow?.restore?.();
    }
    mainsWindow?.focus?.();
    // mainsWindow.setAlwaysOnTop(true);
    return;
  }
  const childWindow = toggleAlwaysOnTop(`child-${res?.id}`);
  if (!!childWindow) {
    if (childWindow?.isMinimized?.()) {
      childWindow?.restore?.();
    }
    childWindow?.focus?.();
    // childWindow.setAlwaysOnTop(true);
    dialog.showMessageBox(childWindow, {
      type: 'warning',
      title: '警告',
      message: '请先关闭该方案的界面监视器，然后再打开流程编辑器',
      buttons: ['确定'],
    });
    return;
  };
  const mainWindow: any = new BrowserWindow({
    width: !!res?.type ? 1440 : 1280,
    height: !!res?.type ? 900 : 810,
    minWidth: !!res?.type ? 1440 : 1280,
    minHeight: !!res?.type ? 900 : 810,
    type: `main-${res?.id}`,
    frame: false, // 隐藏窗口框架
    skipTaskbar: false, //是否在任务栏中显示窗口
    kiosk: false,
    // icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: preload,
      webSecurity: false, //网络安全，false允许访问本地文件
      nodeIntegration: true, // 是否集成Node
    },
  });
  mainWindow['customType'] = `main-${res?.id}`;
  mainWindow.on('focus', () => {
    mainWindow.setAlwaysOnTop(false);
  });
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

  const urlParams = res?.type === 'ccd'
    ? `#/ccd?id=${res.id}&number=${mainWindow.id}`
    : res?.type === 'flow'
      ? `#/flow?id=${!!res.id && res.id !== 'new' ? res.id : ''}&number=${mainWindow.id}`
      : res?.type === 'software'
        ? `#/softwareopen?url=${res.url}&number=${mainWindow.id}`
        : `?number=${mainWindow.id}`;
  if (VITE_DEV_SERVER_URL) {
    // 开发环境
    mainWindow.loadURL(`${VITE_DEV_SERVER_URL}${urlParams}`);
  } else {
    const url = `file://${indexHtml}${urlParams}`;
    console.log(`加载的页面url:${url}`);
    mainWindow.loadURL(url);
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
  if (!res) {
    // Auto update
    update(mainWindow);
  }
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
