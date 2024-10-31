import { App } from 'electron';

import PluginService from './plugin.service';
import * as Controller from './plugin.controller';

export default {
  async init (app: App): Promise<void> {
    Controller.register()
    await PluginService.appOnReady(app);
  }
};
