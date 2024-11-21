import { fetchGet, fetchPost, fetchPut, fetchDelete } from '@/utils/fetch';
import * as _ from 'lodash-es';

const V1 = '';
// 获取首页项目列表
export const getDataList = () => {
  return fetchGet(`${V1}/projects`);
};
// 获取列表任务状态
export const getListStatusService = () => {
  return fetchGet(`${V1}/tasks`);
};
// 根据id新增项目
export async function addParams(params: any) {
  return fetchPost(`${V1}project`, { body: params });
};
// 根据id获取项目
export async function getParams(id: string) {
  return fetchGet(`${V1}project/${id}`);
};
// 根据id修改项目
export async function updateParams(id: string, params?: any) {
  return fetchPut(`${V1}project/${id}`, { body: params });
};
// 根据id删除项目
export async function deleteParams(id: string) {
  return fetchDelete(`${V1}project/${id}`);
};
// 获取任务状态
export const getFlowStatusService = (id: string) => {
  return fetchGet(`${V1}/task/${id}`);
};
// 业务启动
export const startFlowService = (params: any) => {
  const { id, ...rest } = params;
  if (!!rest && !_.isEmpty(rest)) {
    return fetchPost(`${V1}/task/${id}`, { body: params });
  } else {
    return fetchPost(`${V1}/task/${id}`);
  }
};
// 业务停止
export const stopFlowService = (id: string) => {
  return fetchDelete(`${V1}/task/${id}`);
};
//手动出发ws推送
export const triggerSocketService = (id: string) => {
  return fetchGet(`${V1}/test_trigger/${id}`);
};
// 根据id获取当前任务的历史记录列表
export const getHistoryList = (id: string) => {
  return fetchGet(`${V1}/project_history/${id}`);
};
// 获取案例库列表
export const getCaseList = () => {
  return fetchGet(`${V1}/case_list`);
};
// 流程图-流程测试-运行流程到此处
export async function processTest(params: object) {
  return fetchPost(`${V1}process_test`, { body: params });
};
// 流程图-单元测试-单节点运行
export async function unitTest(params: object) {
  return fetchPost(`${V1}unit_test`, { body: params });
};