import { App, dialog, FileFilter } from 'electron';

import { ChooseFilesResponseBody, ChooseFolderResponseBody } from '../../ipc/types';


class NativeFileService {
  //  默认设置
  defaultData = { storePath: '' };

  /**
   * 应用初始化时执行
   * @param app
   */
  appOnReady(app: App) {
    // console.log('do some thing after appOnReady');
  }

  async onChooseFolder(): Promise<ChooseFolderResponseBody> {
    const result = await dialog.showOpenDialog({
      title: 'Select Folder',
      message: 'Select Folder',
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, directoryPath: '' };
    }
    return { success: true, directoryPath: result.filePaths[0] };
  }

  async onChooseFiles(multi: boolean, filters: FileFilter): Promise<ChooseFilesResponseBody> {
    let fileFilters;
    if (!filters) {
      fileFilters = [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp'] },
        { name: 'Project', extensions: ['ubv'] }
      ]
    } else {
      fileFilters = [filters]
    }
    const result = await dialog.showOpenDialog({
      title: 'Select File',
      message: 'Select File',
      properties: multi ? ['openFile', 'multiSelections'] : ['openFile'],
      filters: fileFilters
    });
    const { filePaths } = result
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, filePaths, };
    }

    return { success: true, filePaths, };
  }
}

export default new NativeFileService();
