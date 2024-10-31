import { App } from 'electron';

import PluginService from './project.service';
import * as Controller from './project.controller';

export default {
  async init (app: App): Promise<void> {
    Controller.register()
    await PluginService.appOnReady(app);
  }
};
