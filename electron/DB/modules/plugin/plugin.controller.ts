import { ipcMain } from 'electron';

import PluginService from './plugin.service';
import { IReq } from '../../types/req';
import { Unsupported } from '../../types/ipc.response';

// const respWrapper = (resp:object, url:string) => {
//
// }
export const register = () => {
  ipcMain.handle('plugin',  (event, req: IReq) => {
    const method = req.method.toLocaleUpperCase()
    const paths = req.url.split('/')
    switch (method) {
      case 'POST':
        return PluginService.add(req.data)
      case 'DELETE':
        return PluginService.delete(paths[paths.length - 1]);
      case 'PUT':
        return PluginService.update(paths[paths.length - 1], req.data);
      case 'GET':
        return PluginService.get(paths[paths.length - 1]);
      default:
        return new Unsupported().to_json()
    }
  });

  ipcMain.handle('pluginList',  (event, req: IReq) => {
    const method = req.method.toLocaleUpperCase()
    switch (method) {
      case 'GET':
        return PluginService.list();
      default:
        return new Unsupported().to_json()
    }
  });
}
