import { IpcRequestEnum } from '@/common/ipc/ipc-request-enum';
import { ChooseFilesResponseBody, ChooseFolderResponseBody, FileFilter } from '@/common/ipc/types';
import ipcClient from '@/api/ipc/ipc-client';
const { shell } = window || {};

/**
 * 调用本地文件浏览器，选择一个folder
 * @param callback 选取结束的callback
 */
export const chooseFolder = (callback: (directoryPath: string | undefined, err: any) => void): void => {
  ipcClient.asyncReq(IpcRequestEnum.ChooseFolder)
    .then((result: ChooseFolderResponseBody) => {
      if (!!result.directoryPath && !!result.directoryPath.length) {
        callback(result.directoryPath, null);
      }
    })
    .catch((err) => {
      callback(undefined, err);
      console.error('Failed to get local directory path: ', err);
    });
};

/**
 * 调用本地文件浏览器，选择一个或多个文件，获得路径列表
 * @param multi 是否可以多选
 * @param callback 选取结束的callback
 * @param filters
 */
export const chooseFile = (
  callback: (
    filePath: Array<string> | undefined, err: any) => void,
  multi: boolean = false,
  filters: FileFilter = { name: 'All Files', extensions: ['*'] }
): void => {
  ipcClient.asyncReq(IpcRequestEnum.ChooseFile, multi, filters)
    .then((result: ChooseFilesResponseBody) => {
      if (!!result.filePaths && !!result.filePaths.length) {
        callback(result.filePaths, null);
      }
    })
    .catch((err) => {
      callback(undefined, err);
      console.error('Failed to get local file path: ', err);
    });
};

/**
 * 点击文件路径，打开相应的文件夹
 * @param path 文件/文件夹路径
 * @param isFile 是否是文件
 * @returns 
 */
export const openFolder = (path: string, isFile?: boolean) => {
  return new Promise((resolve, reject) => {
    if (!path) {
      reject('请打开正确路径')
    }
    if (isFile) {
      shell?.openPath(path);
    } else {
      shell?.showItemInFolder(path);
    }
    resolve('success');
  })
}
