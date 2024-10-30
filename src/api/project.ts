import ipcClient from '@/api/ipc/ipc-client';

class ProjectApi {
  /**
   * 新增方案
   */
  async add(data: object) {
    return ipcClient.asyncReq('project',
      {
        method: 'POST',
        url: '/project',
        data: data,
      }
    )
  }

  /**
   * 删除方案
   */
  async delete(projectID: string) {
    return ipcClient.asyncReq('project',
      {
        method: 'DELETE',
        url: `/project/${projectID}`,
      }
    )
  }

  /**
   * 更新方案信息
   */
  async update(projectID: string, data: object) {
    return ipcClient.asyncReq('project',
      {
        method: 'PUT',
        url: `/project/${projectID}`,
        data: data
      }
    )
  }

  /**
   * 获取单个方案信息
   */
  async get(projectID: string) {
    return ipcClient.asyncReq('project',
      {
        method: 'GET',
        url: `/project/${projectID}`,
      }
    )
  }

  /**
   * 获取方案列表
   */
  async list() {
    return ipcClient.asyncReq('projectList',
      {
        method: 'GET',
        url: `/project-list`,
      }
    )
  }

  /**
  * 新增缓存
  */
  async addStorage(id: string, data: object) {
    return ipcClient.asyncReq('project',
      {
        method: 'POSTSTORAGE',
        url: `/project/${id}`,
        data: data,
      }
    )
  }

  /**
   * 删除缓存
   */
  async deleteStorage(id: string) {
    return ipcClient.asyncReq('project',
      {
        method: 'DELETESTORAGE',
        url: `/project/${id}`,
      }
    )
  }

  /**
   * 更新缓存
   */
  async updateStorage(id: string, data: object) {
    return ipcClient.asyncReq('project',
      {
        method: 'PUTSTORAGE',
        url: `/project/${id}`,
        data: data
      }
    )
  }

  /**
   * 获取单个缓存
   */
  async getStorage(id: string) {
    return ipcClient.asyncReq('project',
      {
        method: 'GETSTORAGE',
        url: `/project/${id}`,
      }
    )
  }
}

export default new ProjectApi()
