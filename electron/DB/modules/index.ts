import {App } from 'electron'

import PluginModule from './plugin/plugin.module';
import ProjectModule from './project/project.module';
import NativeFileModule from './native-file/native-file.module';

export default {
  async init (app:App):Promise<void>{
    await PluginModule.init(app)
    await ProjectModule.init(app)
    await NativeFileModule.init(app)
  }
}
