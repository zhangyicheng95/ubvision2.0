import { ipcMain } from 'electron';

import ProjectService from './project.service';
import { IReq } from '../../types/req';
import { Unsupported } from '../../types/ipc.response';

export const register = () => {
  ipcMain.handle('project', (event, req: IReq) => {
    const method = req.method.toLocaleUpperCase()
    const paths = req.url.split('/')
    switch (method) {
      case 'POST':
        return ProjectService.add(req.data)
      case 'DELETE':
        return ProjectService.delete(paths[paths.length - 1]);
      case 'PUT':
        return ProjectService.update(paths[paths.length - 1], req.data);
      case 'GET':
        return ProjectService.get(paths[paths.length - 1]);
      case 'POSTSTORAGE':
        return ProjectService.addStorage(paths[paths.length - 1], req.data)
      case 'DELETESTORAGE':
        return ProjectService.deleteStorage(paths[paths.length - 1]);
      case 'PUTSTORAGE':
        return ProjectService.updateStorage(paths[paths.length - 1], req.data);
      case 'GETSTORAGE':
        return ProjectService.getStorage(paths[paths.length - 1]);
      default:
        return new Unsupported().to_json()
    }
  });

  ipcMain.handle('projectList', (event, req: IReq) => {
    const method = req.method.toLocaleUpperCase()
    switch (method) {
      case 'GET':
        return ProjectService.list();
      default:
        return new Unsupported().to_json()
    }
  });
}
