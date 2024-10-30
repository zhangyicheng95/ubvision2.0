import ipcClient from '@/api/ipc/ipc-client';

class PluginApi {
  /**
   * 新增插件
   */
  async add(data: object) {
    return ipcClient.asyncReq('plugin',
      {
        method: 'POST',
        url: '/plugin',
        data: data
      }
    );
  }

  /**
   * 删除插件
   */
  async delete(pluginID: string) {
    return ipcClient.asyncReq('plugin',
      {
        method: 'DELETE',
        url: `/plugin/${pluginID}`
      }
    );
  }

  /**
   * 更新插件信息
   */
  async update(pluginID: string, data: object) {
    return ipcClient.asyncReq('plugin',
      {
        method: 'PUT',
        url: `/plugin/${pluginID}`,
        data: data
      }
    );
  }

  /**
   * 获取单个插件信息
   */
  async get(pluginID: string) {
    return ipcClient.asyncReq('plugin',
      {
        method: 'GET',
        url: `/plugin/${pluginID}`
      }
    );
  }

  /**
   * 获取插件列表
   */
  async list() {
    return ipcClient.asyncReq('pluginList',
      {
        method: 'GET',
        url: `/plugin-list`
      }
    );
  }
}

export default new PluginApi();
