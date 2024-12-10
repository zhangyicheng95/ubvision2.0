import { fetchGet, fetchPost, fetchPut, fetchDelete } from '@/utils/fetch';

const V1 = '';
// 获取本地全部插件列表
export const getDirPluginListService = () => {
  return fetchGet(`${V1}/plugin_info_list`);
};
// 获取已载入的插件列表
export const getPluginListService = () => {
  return fetchGet(`${V1}/plugins`);
};

// 根据id新增插件
export async function addPluginService(params: any) {
  return fetchPost(`${V1}plugin`, { body: params });
}

// 根据id获取插件
export async function getPluginService(id: string) {
  return fetchGet(`${V1}plugin/${id}`);
}

// 根据id修改插件
export async function updatePluginService(id: string, params: any) {
  return fetchPut(`${V1}plugin/${id}`, { body: params });
}

// 根据id删除插件
export async function deletePluginService(id: string) {
  return fetchDelete(`${V1}plugin/${id}`);
}
