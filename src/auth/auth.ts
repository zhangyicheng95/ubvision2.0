export const authorIds = [
  {
    id: 'home',
    children: [
      'home.list',
    ],
  },
  {
    id: 'projects',
    children: [
      'projects.list',
      'projects.import',
      'projects.new',
      'projects.modify',
      'projects.copy',
      'projects.delete',
      'projects.export',
      'projects.start',
      'projects.stop',
      'projects.restart',
      'projects.exportConfig',
      'projects.history',
      'projects.history.rollBack',
      'projects.nodeStatus',
    ],
  },
  {
    id: 'monitor',
    children: [
      'monitor.list',
      'monitor.add',
      'monitor.delete',
      'monitor.addDesk',
      'monitor.addSelfStart',
      'monitor.headerOperation',
      'monitor.changeLogo',
      // 'monitor.copyUrl',
    ],
  },
  {
    id: 'plugins',
    children: [
      'plugins.list',
      'plugins.download',
      'plugins.import',
      'plugins.modify',
      'plugins.delete',
      'plugins.export',
    ],
  },
  {
    id: 'resource',
    children: ['resource.list', 'resource.new', 'resource.delete'],
  },
  {
    id: 'software',
    children: [
      'software.list',
      'software.new',
      'software.modify',
      'software.delete',
    ],
  },
  {
    id: 'auth',
    children: [
      'auth.users',
      'auth.users.add',
      'auth.users.modify',
      'auth.users.delete',
      'auth.groups',
      'auth.groups.add',
      'auth.groups.modify',
      'auth.groups.delete',
    ],
  },
  {
    id: 'ccd-home',
    children: ['ccd-home.list'],
  },
  {
    id: 'ccd-history',
    children: ['ccd-history.list'],
  },
  {
    id: 'ccd-control',
    children: ['ccd-control.list'],
  },
  {
    id: 'ccd-setting',
    children: ['ccd-setting.list'],
  },
  {
    id: 'ccd-log',
    children: ['ccd-log.list'],
  },
];
