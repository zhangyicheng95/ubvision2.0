import { App } from 'electron'

import DB from '../../database/DB';
import { Exists, NotFound, Success } from '../../types/ipc.response';
import { md5sum } from '../../../main/util';

class ProjectService {
  //  默认设置
  defaultData = { storePath: '' };

  collection: DB

  constructor() {
    this.collection = new DB('project')
  }

  /**
   * 应用初始化时执行
   * @param app
   */
  appOnReady(app: App) {
    // console.log('do some thing after appOnReady');
  }

  async add(data: any) {
    const condition = { id: md5sum(JSON.stringify(data)) }
    const exists = await this.collection.findOne(condition)
    if (exists) return new Exists(exists).to_json()

    await this.collection.insert({ ...data, ...condition })
    const projectDocument = await this.collection.findOne(condition)

    return new Success(projectDocument, 'project added!').to_json()
  }

  async delete(projectID: string) {
    const condition = { id: projectID }
    const exists = await this.collection.findOne(condition)
    await this.collection.remove(condition)
    return new Success(exists, `project: ${projectID} removed`).to_json()
  }

  async update(projectID: string, data: object) {
    const condition = { id: projectID }
    const exists = await this.collection.findOne(condition)
    if (!exists) return new NotFound(null, `project: ${projectID} not found!`).to_json()
    await this.collection.update(condition, { $set: data }, { multi: true })
    return new Success().to_json()
  }

  async get(projectID: string) {
    const condition = { id: projectID }
    const projectDocument = await this.collection.findOne(condition)
    if (!projectDocument) return new NotFound(null, `project: ${projectID} not found!`).to_json()
    return new Success(projectDocument).to_json()
  }

  async list() {
    const projectList = await this.collection.find()
    return new Success(projectList).to_json()
  }

  async addStorage(id: string, data: object) {
    const condition = { id: id }
    const exists = await this.collection.findOne(condition)
    if (exists) await this.deleteStorage(id)

    await this.collection.insert({ ...data, ...condition })
    const projectDocument = await this.collection.findOne(condition)

    return new Success(projectDocument, 'project added!').to_json()
  }
  async getStorage(id: string) {
    const condition = { id: id }
    const projectDocument = await this.collection.findOne(condition)
    if (!projectDocument) return new NotFound(null, `project: ${id} not found!`).to_json()
    return new Success(projectDocument).to_json()
  }
  async deleteStorage(id: string) {
    const condition = { id: id }
    const exists = await this.collection.findOne(condition)
    await this.collection.remove(condition)
    return new Success(exists, `project: ${id} removed`).to_json()
  }

  async updateStorage(id: string, data: object) {
    const condition = { id: id }
    const exists = await this.collection.findOne(condition)
    if (!exists) return new NotFound(null, `project: ${id} not found!`).to_json()
    await this.collection.update(condition, { $set: data }, { multi: true })
    return new Success().to_json()
  }
}

export default new ProjectService();
