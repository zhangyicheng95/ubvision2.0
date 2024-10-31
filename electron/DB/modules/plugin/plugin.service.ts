import {App } from 'electron'

import DB  from '../../database/DB';
import { Exists, NotFound, Success } from '../../types/ipc.response';
import { md5sum } from '../../util';

class PluginService {
  //  默认设置
  defaultData = { storePath: '' };

  collection:DB

  constructor () {
    this.collection = new DB('plugin')
  }

  /**
   * 应用初始化时执行
   * @param app
   */
  appOnReady (app: App) {
    // console.log('do some thing after appOnReady');
  }

  async add (data: object) {
    const condition = { id: md5sum(JSON.stringify(data)) }
    const exists = await this.collection.findOne(condition)
    if(exists) return new Exists(exists).to_json()

    await this.collection.insert({...data, ...condition})
    const pluginDocument = await this.collection.findOne(condition)

    return new Success(pluginDocument, 'plugin add plugin').to_json()
  }

  async delete (pID: string) {
    const condition = { id: pID }
    const exists = await this.collection.findOne(condition)
    await this.collection.remove(condition)
    return new Success(exists,`plugin: ${pID} removed`).to_json()
  }

  async update (pID: string, data: object) {
    const condition = { id: pID }
    const exists = await this.collection.findOne(condition)
    if(!exists) return new NotFound(null, `plugin: ${pID} not found!`).to_json()
    await this.collection.update(condition, { $set:data }, {multi:true})
    return new Success().to_json()
  }

  async get (pID: string){
    const condition = { id: pID }
    const pluginDocument = await this.collection.findOne(condition)
    if(!pluginDocument) return new NotFound(null, `plugin: ${pID} not found!`).to_json()
    return new Success(pluginDocument).to_json()
  }

  async list (){
    const pluginList = await this.collection.find()
    return new Success(pluginList).to_json()
  }
}

export default new PluginService();
