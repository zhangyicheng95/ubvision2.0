import { fetchGet, fetchPost, fetchPut, fetchDelete } from '@/utils/fetch';

const V1 = '';
// 获取本地全部插件列表
export const getDirPluginList = () => {
  return fetchGet(`${V1}/plugin_info_list`);
};
// 获取已载入的插件列表
export const getPluginList = () => {
  return fetchGet(`${V1}/plugins`);
};

// 根据id新增插件
export async function addPlugin(params: any) {
  return fetchPost(`${V1}plugin`, { body: params });
}

// 根据id获取插件
export async function getPlugin(id: string) {
  return fetchGet(`${V1}plugin/${id}`);
}

// 根据id修改插件
export async function updatePlugin(id: string, params: any) {
  return fetchPut(`${V1}plugin/${id}`, { body: params });
}

// 根据id删除插件
export async function deletePlugin(id: string) {
  return fetchDelete(`${V1}plugin/${id}`);
}
