import { ipcMain, IpcMainInvokeEvent,FileFilter } from 'electron';

import FileService from './native-file.service';
import { IpcRequestEnum } from '../../ipc/ipc-request-enum';
import { ChooseFilesResponseBody, ChooseFolderResponseBody } from '../../ipc/types';



export const register = () => {
  ipcMain.handle(IpcRequestEnum.ChooseFolder, async (): Promise<ChooseFolderResponseBody> => {
      return FileService.onChooseFolder()
    }
  );

  ipcMain.handle(IpcRequestEnum.ChooseFile,
    async (event:IpcMainInvokeEvent,multi:boolean, filters:FileFilter): Promise<ChooseFilesResponseBody> => {
      return FileService.onChooseFiles(multi, filters)
    }
  );


}
