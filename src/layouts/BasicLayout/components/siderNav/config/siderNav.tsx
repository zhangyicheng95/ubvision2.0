import React from 'react';

export const menuConfig = [
  {
    name: '首页',
    icon: 'home',
    path: `/home`,
    key: `/home`,
    id: 'home', // 权限id
    check: true, // 是否校验
  },
  {
    name: '项目列表',
    icon: 'project',
    path: `/project`,
    key: `/project`,
    id: 'projects', // 权限id
    check: true, // 是否校验
  },
  {
    name: '监控列表',
    icon: 'alert',
    path: `/alert`,
    key: `/alert`,
    id: 'monitor', // 权限id
    check: false, // 是否校验
  },
  // {
  //   name: '采集器',
  //   icon: 'collect',
  //   path: `/collect`,
  //   key: `/collect`,
  //   id: 'collect', // 权限id
  //   check: true // 是否校验
  // },
  {
    name: '插件管理',
    icon: 'plugin',
    path: `/plugin`,
    key: `/plugin`,
    id: 'plugins', // 权限id
    check: true, // 是否校验
  },
  // {
  //   name: '资源管理',
  //   icon: 'model',
  //   path: `/resource/model`,
  //   key: `/resource/model`,
  //   id: 'resource', // 权限id
  //   check: true, // 是否校验
  // },
  {
    name: '三方软件管理',
    icon: 'software',
    path: `/software`,
    key: `/software`,
    id: 'software', // 权限id
    check: true, // 是否校验
  },
  {
    name: '权限管理',
    icon: 'auth',
    path: `/auth`,
    key: `/auth`,
    id: 'auth', // 权限id
    check: true, // 是否校验
  },
];
