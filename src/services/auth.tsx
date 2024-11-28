import { fetchGet, fetchPost, fetchPut, fetchDelete } from '@/utils/fetch';

const V1 = '';
// 登录
export const login = (params: any) => {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve({
  //       code: 'SUCCESS',
  //       data: {
  //         userName: 'admin',
  //         nickName: '张三',
  //         loginTime: 1698137210810,
  //         authList: [
  //           "projects",
  //           "projects.list",
  //           "projects.import",
  //           "projects.new",
  //           "projects.modify",
  //           "projects.copy",
  //           "projects.delete",
  //           "projects.export",
  //           "projects.start",
  //           "projects.stop",
  //           "projects.restart",
  //           "projects.exportConfig",
  //           "projects.history",
  //           "projects.history.rollBack",
  //           "projects.nodeStatus",
  //           "monitor",
  //           "monitor.list",
  //           "monitor.delete",
  //           "monitor.addDesk",
  //           "monitor.addSelfStart",
  //           "plugins",
  //           "plugins.list",
  //           "plugins.download",
  //           "plugins.import",
  //           "plugins.modify",
  //           "plugins.delete",
  //           "plugins.export",
  //           "resource",
  //           "software",
  //           "auth",
  //           "auth.users",
  //           "auth.users.add",
  //           "auth.users.delete",
  //           "auth.users.modify",
  //           "auth.groups",
  //           "auth.groups.add",
  //           "auth.groups.modify",
  //           "auth.groups.delete"
  //         ]
  //       }
  //     });
  //   }, 2000);
  // });
  return fetchPost(`${V1}/login`, { body: params });
};
// 登出
export const logout = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        code: 'SUCCESS',
      });
    }, 2000);
  });
  return fetchGet(`${V1}/logout`);
};
// 修改密码
export const modifyPassword = (id: string, params: any) => {
  return fetchPut(`${V1}/user_password/${id}`, { body: params });
};
// 获取权限分组list
export const getGroupList = () => {
  return fetchGet(`${V1}/user_groups`);
};
// 新增分组
export const addGroup = (params: any) => {
  return fetchPost(`${V1}/user_group`, { body: params });
};
// 根据id获取单个分组详情
export const getGroupById = (id: string) => {
  return fetchGet(`${V1}/user_group/${id}`);
};
// 根据id更新分组
export const updateGroupById = (id: string, params: any) => {
  return fetchPut(`${V1}/user_group/${id}`, { body: params });
};
// 根据id删除分组
export const deleteGroupById = (id: string) => {
  return fetchDelete(`${V1}/user_group/${id}`);
};
// 获取用户列表
export const getUserList = () => {
  return fetchGet(`${V1}/users`);
};
// 新增用户
export const addUser = (params: any) => {
  return fetchPost(`${V1}/user`, { body: params });
};
// 根据id获取单个用户详情
export const getUserById = (id: string) => {
  return fetchGet(`${V1}/user/${id}`);
};
// 根据id更新用户
export const updateUserById = (id: string, params: any) => {
  return fetchPut(`${V1}/user/${id}`, { body: params });
};
// 根据id删除用户
export const deleteUserById = (id: string) => {
  return fetchDelete(`${V1}/user/${id}`);
};
// 访问gateway获取权限
export const getAuthApi = () => {
  return new Promise((resolve, reject) => {
    // setTimeout(() => {
    resolve({
      code: 200,
      data: {
        userName: '张意诚',
        passWord: '123456'
      }
    });
    // }, 2000);
  });
};
