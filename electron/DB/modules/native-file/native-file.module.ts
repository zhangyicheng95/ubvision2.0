import { App } from 'electron';

import FileService from './native-file.service';
import * as Controller from './native-file.controller';

export default {
  async init (app: App): Promise<void> {
    Controller.register()
    await FileService.appOnReady(app);
  }
};
