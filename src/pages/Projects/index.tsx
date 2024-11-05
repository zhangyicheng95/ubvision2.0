import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Form,
  message,
  Modal,
  Dropdown,
  Upload,
  Input,
  Popconfirm,
  Checkbox,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  FormOutlined,
  UploadOutlined,
  ReconciliationOutlined,
  CloudDownloadOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
  BarsOutlined,
  SelectOutlined,
  CloudUploadOutlined,
  BlockOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import * as _ from 'lodash-es';
import * as XLSX from 'xlsx';
import TooltipDiv from '@/components/TooltipDiv';
import PrimaryTitle from '@/components/PrimaryTitle';
import {
  copyUrlToClipBoard,
  downFileFun,
  getUserAuthList,
  guid,
} from '@/utils/utils';
import {
  addParams,
  deleteParams,
  getFlowStatusService,
  getHistoryList,
  getParams,
  startFlowService,
  stopFlowService,
  updateParams,
} from '@/services/flowEditor';
import styles from './index.module.less';
import JSZip from 'jszip';
import { openFolder } from '@/api/native-path';
import BasicTable from '@/components/BasicTable';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

const { confirm } = Modal;

interface Props { }
const userAuthList = getUserAuthList();

const ProjectPage: React.FC<Props> = (props: any) => {
  const { ipcRenderer }: any = window?.Electron || {};
  const { projectList, getProjectListFun } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const timerRef = useRef<any>();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [searchVal, setSearchVal] = useState('');

  // 进入页面默认拉取
  useEffect(() => {
    getProjectListFun?.();

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, []);
  useEffect(() => {
    setDataList(projectList);
  }, [projectList]);
  // 模糊查询
  const onSearch = (val: any) => {
    setSearchVal(val);
  };
  // 导入项目
  const uploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: true,
    beforeUpload(file: any) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          const data = _.omit(_.omit(JSON.parse(result), 'id'), 'alertShow');
          setUpdateLoading(true);
          // ProjectApi.add(data).then((res) => {
          addParams(data).then((res) => {
            if (
              !!res &&
              res.code === 'SUCCESS' &&
              !!res.data &&
              !!res.data?.id
            ) {
              // navigate('/flow', {
              //   state: data,
              // });
              getProjectListFun?.();
            } else {
              message.error(res?.message || res?.msg || '接口异常');
            }
            setUpdateLoading(false);
          });
        } catch (err) {
          message.error('json文件格式错误，请修改后上传。');
          console.error(err);
        }
      };
      return false;
    },
  };
  const settingList: any = [
    {
      key: `all-selecetd`,
      label: <Button
        icon={<CopyOutlined />}
        type="primary"
        style={{ width: '100%' }}
        onClick={() => {
          setSelectedRows((prev: any) => {
            if (prev?.length === dataList?.length) {
              return [];
            }
            return dataList?.map?.((item: any) => item.id);
          });
        }}
      >
        {selectedRows?.length === dataList?.length
          ? '取消全选'
          : '批量全选'}
      </Button>
    },
    userAuthList.includes('projects.delete') ? {
      key: `delete-selecetd`,
      label: <Button
        icon={<DeleteOutlined />}
        type="primary"
        disabled={!selectedRows?.length}
        onClick={() => {
          setLoading(true);
          const onDelete = (id: string, index: number) => {
            deleteParams(id).then((res) => {
              if (!!res && res.code === 'SUCCESS') {
                if (!!selectedRows[index + 1]) {
                  onDelete(selectedRows[index + 1], index + 1);
                } else {
                  getProjectListFun?.();
                }
              } else {
                getProjectListFun?.();
              }
            });
          };
          onDelete(selectedRows[0], 0);
        }}
      >
        批量删除
      </Button>
    } : null,
    userAuthList.includes('projects.export') ? {
      key: `export-selecetd`,
      label: <Button
        icon={<CloudDownloadOutlined />}
        type="primary"
        onClick={() => {
          var zip = new JSZip();
          let list = [];
          if (selectedRows?.length) {
            list = (selectedRows || [])
              ?.map?.((row: string) => {
                return dataList?.filter(
                  (i: any) => i.id === row
                )?.[0];
              })
              .filter(Boolean);
          } else {
            list = dataList;
          }
          list?.forEach((record: any) => {
            const {
              createdAt,
              updatedAt,
              id,
              project_id,
              _id,
              running,
              alertShow,
              ...rest
            } = record;
            zip.file(
              `${record?.name}.json`,
              JSON.stringify(rest)
            );
          });
          zip
            .generateAsync({ type: 'blob' })
            .then((content: any) => {
              downFileFun(content, '方案列表.zip');
            });
          setSelectedRows([]);
        }}
      >
        批量导出
      </Button>
    } : null,
  ]?.filter(Boolean);

  return (
    <div className={`${styles.projectPage}`}>
      <PrimaryTitle title="方案列表  Projects" onSearch={onSearch}>
        {userAuthList.includes('projects.delete') ||
          userAuthList.includes('projects.export') ? (
          <Dropdown
            getPopupContainer={(triggerNode: any) => {
              return triggerNode.parentNode || document.body;
            }}
            menu={{ items: settingList }}
          >
            <Button icon={<BlockOutlined />} type="primary">
              批量操作
            </Button>
          </Dropdown>
        ) : null}
        {userAuthList.includes('projects.import') ? (
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              type="primary"
              loading={updateLoading}
            >
              导入方案
            </Button>
          </Upload>
        ) : null}
        {userAuthList.includes('projects.new') ? (
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              // navigate('/flow', { replace: true });
              ipcRenderer?.ipcCommTest(
                'alert-open-browser',
                JSON.stringify({
                  type: 'main',
                  data: { id: 'new' },
                })
              );
            }}
            loading={updateLoading}
          >
            新建方案
          </Button>
        ) : null}
      </PrimaryTitle>
      <div className="home-page-body scrollbar-style">
        {userAuthList.includes('projects.list')
          ? (dataList || [])
            ?.sort((a: any, b: any) => {
              return b.updatedAt - a.updatedAt;
            })
            .filter((item: any) => {
              return item.name.indexOf(searchVal) > -1;
            })
            ?.map?.((item: any, index: number) => {
              const { id } = item;
              return (
                <ProjectItem
                  key={id}
                  item={item}
                  index={index}
                  setLoading={setLoading}
                  getList={() => getProjectListFun?.()}
                  setDataList={setDataList}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                />
              );
            })
          : null}
      </div>
    </div>
  );
};

export default ProjectPage;

const ProjectItem = (props: any) => {
  const [form] = Form.useForm();
  const { validateFields, resetFields } = form;
  const {
    item,
    index,
    getList,
    setLoading,
    setDataList,
    selectedRows,
    setSelectedRows,
  } = props;
  const navigate = useNavigate();
  const {
    name,
    id,
    running,
    plugin_dir,
    plugin_path,
    updatedAt,
    flowData,
    contentData,
  } = item;
  const { ipcRenderer }: any = window?.Electron || {};
  const [logSavePath, setLogSavePath] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [historyVisible, setHistoryVisible] = useState('');
  const [stateList, setStateList] = useState([]);
  const [stateVisible, setStateVisible] = useState('');
  const [renameVisible, setRenameVisible] = useState(false);

  // 日志存储路径
  useEffect(() => {
    let path = '';
    try {
      const result = JSON.parse(
        localStorage.getItem('general_setting') || '{}'
      );
      path = !!result?.logSave_path ? result?.logSave_path : '';
    } catch (err) {
      path = '';
    }
    if (!!path) {
      setLogSavePath(`${path}\\${id}\\logs\\master.log`);
      return;
    } else {
      setLogSavePath(`C:\\UBVisionData\\.ubvision\\${id}\\logs\\master.log`);
      return;
    }

    ipcRenderer?.once('home-dir-read-reply', function (res: any) {
      if (res === 'error') {
        message.error('系统信息获取失败');
      } else {
        path = res;
        setLogSavePath(`${path}\\.ubvision\\${id}\\logs\\master.log`);
      }
    });
    ipcRenderer?.ipcCommTest('home-dir-read');
  }, [localStorage.getItem('general_setting')]);
  // 重命名
  const onRename = (name: string) => {
    getParams(id).then((res) => {
      if (!!res && res.code === 'SUCCESS') {
        const params = {
          ...res.data,
          name,
        };
        updateParams(item?.id, params).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            message.success('更新成功');
            getList();
            setRenameVisible(false);
          } else {
            message.error(res?.message || '接口异常');
          }
        });
      } else {
        message.error(res?.message || '接口异常');
      }
    });
  };
  // 编辑
  const onModify = (item: any) => {
    const { id } = item;
    // if (process.env.NODE_ENV === 'development') {
    ipcRenderer?.ipcCommTest(
      'alert-open-browser',
      JSON.stringify({
        type: 'main',
        data: {
          id,
        },
      })
    );
    // } else {
    //   navigate('/flow', {
    //     state: item,
    //   });
    // }
  };
  // 复制
  const onCopy = (item: any) => {
    getParams(id).then((res) => {
      if (!!res && res.code === 'SUCCESS') {
        const {
          name,
          createdAt,
          updatedAt,
          id,
          project_id,
          _id,
          running,
          alertShow,
          ...rest
        } = res.data;
        const params = {
          ...rest,
          name: `副本_${name}`,
        };
        addParams(params).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            message.success('复制成功');
            getList();
          } else {
            message.error(res?.message || '接口异常');
          }
        });
      } else {
        message.error(res?.message || '接口异常');
      }
    });
  };
  // 删除项目
  const onDelete = (item: any) => {
    const { id, name } = item;
    confirm({
      title: `确定删除?`,
      content: '删除后无法恢复',
      onOk() {
        deleteParams(id).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            ipcRenderer?.ipcCommTest(
              'alert-delete-startUp',
              JSON.stringify({
                id,
                name: `${name}.lnk`,
              })
            );
            message.success('删除成功');
            getList();
          } else {
            message.error(res?.message || '接口异常');
          }
        });
      },
      onCancel() { },
    });
  };
  // 导出项目
  const onExport = (item: any) => {
    const { createdAt, updatedAt, id, project_id, _id, running, ...rest } =
      item;
    downFileFun(JSON.stringify(rest), `${item?.name}.json`);
  };
  // 更新项目
  const onUpdateProject = (params: any) => {
    setLoading(true);
    updateParams(id, params).then((res) => {
      if (!!res && res.code === 'SUCCESS') {
        message.success('更新成功');
      } else {
        message.error(res?.message || '接口异常');
      }
      setLoading(false);
    });
  };
  // 启动任务
  const onStart = (item: any) => {
    setLoading(true);
    startFlowService({ id: item.id || '' }).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        message.success('任务启动成功');
        setDataList((prev: any) =>
          prev?.map?.((i: any) => {
            if (i.id === item.id) {
              return { ...i, running: true };
            }
            return i;
          })
        );
      } else {
        message.error(res?.msg || res?.message || '启动接口异常');
      }
      setLoading(false);
    });
  };
  // 停止任务
  const onEnd = (item: any) => {
    const { id } = item;
    setLoading(true);
    stopFlowService(id || '').then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        message.success('任务停止成功');
        setDataList((prev: any) =>
          prev?.map?.((i: any) => {
            if (i.id === item.id) {
              return { ...i, running: false };
            }
            return i;
          })
        );
      } else {
        message.error(res?.msg || res?.message || '停止接口异常');
      }
      setLoading(false);
    });
  };
  // 重启任务
  const onReStart = (item: any) => {
    const { id } = item;
    setLoading(true);
    stopFlowService(id || '').then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        setTimeout(() => {
          onStart(item);
        }, 1000);
      } else {
        message.error(res?.msg || res?.message || '接口异常');
      }
    });
  };
  // 操作列表
  const operations = useMemo(() => {
    return [
      {
        key: 'copy',
        label: '复制',
        icon: <CopyOutlined className="contextMenu-icon" />,
        describtion: 'Copy',
        click: onCopy,
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined className="contextMenu-icon" />,
        describtion: 'Delete',
        click: onDelete,
        disabled: !!running,
      },
      {
        key: 'start',
        label: '启动',
        icon: <PlayCircleOutlined className="contextMenu-icon" />,
        describtion: 'Start',
        click: onStart,
        disabled: !!running,
      },
      {
        key: 'stop',
        label: '停止',
        icon: <PauseOutlined className="contextMenu-icon" />,
        describtion: 'Stop',
        click: onEnd,
        disabled: !running,
      },
    ];
  }, [running]);
  // 获取历史记录列表
  const getHistoryListFun = () => {
    setLoading(true);
    getHistoryList(id).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        setHistoryList(res?.data?.reverse() || []);
        setHistoryVisible(name);
      } else {
        message.error(res?.msg || res?.message || '启动接口异常');
      }
      setLoading(false);
    });
  };
  // 获取节点状态列表
  const getStateListFun = () => {
    setLoading(true);
    getFlowStatusService(id).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        const result: any = Object.entries(res?.data)?.map?.((res: any) => {
          return res[1];
        });
        setStateList(result || []);
        setStateVisible(name);
      } else {
        message.error(res?.msg || res?.message || '启动接口异常');
      }
      setLoading(false);
    });
  };
  const columns = [
    {
      title: '版本时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      // width: '50%',
      render: (text: any) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '70px',
      render: (text: any, record: any) => {
        const { filepath } = record;
        return userAuthList.includes('projects.history.rollBack') ? (
          <div>
            <Popconfirm
              title="确定回滚?"
              onConfirm={() => {
                // 读取完，返回结果
                ipcRenderer?.once(
                  'resource-file-read-reply',
                  function (file: any) {
                    if (file === 'error') {
                      message.error('文件读取失败');
                    } else {
                      try {
                        const item = JSON.parse(file);
                        updateParams(id, item).then((res) => {
                          if (!!res && res.code === 'SUCCESS') {
                            getList();
                          } else {
                            message.error(
                              res?.message || res?.msg || '接口异常'
                            );
                          }
                        });
                      } catch (err) {
                        console.log(err);
                      }
                    }
                  }
                );
                // 触发读取
                ipcRenderer?.ipcCommTest('resource-file-read', filepath);
              }}
            >
              <a>回滚</a>
            </Popconfirm>
          </div>
        ) : (
          '-'
        );
      },
    },
  ];
  const stateColumns = [
    {
      title: '节点',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: '进程id',
      dataIndex: 'pid',
      key: 'pid',
      width: '20%',
      sorter: (a: any, b: any) => (a.pid + '').localeCompare(b.pid + ''),
    },
    {
      title: 'cpu',
      dataIndex: 'cpu',
      key: 'cpu',
      width: '20%',
      sorter: (a: any, b: any) => a.cpu.localeCompare(b.cpu),
    },
    {
      title: '内存',
      dataIndex: 'mem',
      key: 'mem',
      width: '20%',
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.mem.localeCompare(b.mem),
    },
  ];
  // 导入界面配置
  const uploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: false,
    beforeUpload(file: any) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          const data = JSON.parse(result);
          const params = {
            ...item,
            contentData: data,
          };
          onUpdateProject(params);

          // setCloudNodeList(data);
          // cloudNodeListLocal.current = data;
          // setNodeVisible(true);
        } catch (err) {
          message.error('json文件格式错误，请修改后上传。');
          console.error(err);
        }
      };
      return false;
    },
  };
  const settingList: any = [
    userAuthList.includes('projects.modify') ? {
      key: `rename-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        setRenameVisible(true);
      }}>
        <FormOutlined className="contextMenu-icon" />
        重命名
        <span className="contextMenu-text">Rename</span>
      </div>
    } : null,
    userAuthList.includes('projects.exportConfig') ? {
      key: `export-${id}`,
      label: <div className='flex-box-justify-between dropdown-box'>
        <CloudDownloadOutlined className="contextMenu-icon" />
        导出/导入
        <span className="contextMenu-text">Export/Import</span>
      </div>,
      children: [
        {
          key: `export-project-${id}`,
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            getParams(id).then((res) => {
              if (!!res && res.code === 'SUCCESS') {
                const {
                  createdAt,
                  updatedAt,
                  id,
                  project_id,
                  _id,
                  running,
                  alertShow,
                  ...rest
                } = res.data;
                downFileFun(JSON.stringify(rest), `${item?.name}.json`);
              } else {
                message.error(res?.message || '接口异常');
              }
            });
          }}>
            <CloudDownloadOutlined className="contextMenu-icon" />
            导出方案
            <span className="contextMenu-text">Export Project</span>
          </div>
        },
        {
          key: `export-config-${id}`,
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            getParams(id).then((res) => {
              if (!!res && res.code === 'SUCCESS') {
                const { nodes } = res?.data?.flowData || {};
                downFileFun(
                  JSON.stringify(nodes),
                  `${item?.name}参数配置.json`
                );
              } else {
                message.error(res?.message || '接口异常');
              }
            });
          }}>
            <CloudDownloadOutlined className="contextMenu-icon" />
            导出节点配置
            <span className="contextMenu-text">Export Config</span>
          </div>
        },
        { type: 'divider' },
        {
          key: `export-alert-${id}`,
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            downFileFun(
              JSON.stringify(contentData),
              `${item?.name}的界面配置.json`
            );
          }}>
            <CloudDownloadOutlined className="contextMenu-icon" />
            导出界面配置
            <span className="contextMenu-text">Export Alert</span>
          </div>
        },
        {
          key: `import-alert-${id}`,
          label: <div className='flex-box-justify-between dropdown-box'>
            <Upload {...uploadProps}>
              <CloudUploadOutlined className="contextMenu-icon" />
              导入界面配置
              <span className="contextMenu-text">Import Alert</span>
            </Upload>
          </div>
        },
      ]
    } : null,
    {
      key: `copyID-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlToClipBoard(id);
      }}>
        <ReconciliationOutlined className="contextMenu-icon" />
        复制方案ID
        <span className="contextMenu-text">Copy ID</span>
      </div>
    },
    { type: 'divider' },
    {
      key: `open-dir-${id}`,
      label: <div className='flex-box-justify-between dropdown-box'>
        <FolderOpenOutlined className="contextMenu-icon" />
        打开路径
        <span className="contextMenu-text">Open Dir</span>
      </div>,
      children: [
        {
          key: `open-project-dir-${id}`,
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            console.log('要打开的方案路径地址：', plugin_dir);
            openFolder(`${plugin_dir}\\plugins`);
          }}>
            <FolderOpenOutlined className="contextMenu-icon" />
            打开方案路径
            <span className="contextMenu-text">Open Project</span>
          </div>
        },
        {
          key: `open-log-dir-${id}`,
          label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
            console.log('要打开的日志路径地址：', logSavePath);
            openFolder(`${logSavePath}\\`);
          }}>
            <FolderOpenOutlined className="contextMenu-icon" />
            打开日志路径
            <span className="contextMenu-text">Open Log</span>
          </div>
        },
      ]
    },
    userAuthList.includes('projects.history') ? {
      key: `reset-history-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        getHistoryListFun();
      }}>
        <HistoryOutlined className="contextMenu-icon" />
        历史记录
        <span className="contextMenu-text">Reset History</span>
      </div>
    } : null,
    userAuthList.includes('projects.nodeStatus') ? {
      key: `node-status-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        getStateListFun();
      }}>
        <BarsOutlined className="contextMenu-icon" />
        节点状态
        <span className="contextMenu-text">Node Status</span>
      </div>
    } : null,
    (userAuthList.includes('projects.delete') || userAuthList.includes('projects.export')) ? {
      key: `node-select-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        setSelectedRows((prev: any) => {
          if (prev.includes(id)) {
            return prev.filter((i: any) => i !== id);
          } else {
            return prev.concat(id);
          }
        });
      }}>
        <SelectOutlined className="contextMenu-icon" />
        多选
        <span className="contextMenu-text">Project Select</span>
      </div>
    } : null,
  ]?.filter(Boolean);

  return (
    <div>
      <Dropdown
        getPopupContainer={(triggerNode: any) => {
          return triggerNode.parentNode || document.body;
        }}
        menu={{ items: settingList }}
        trigger={['contextMenu']}
      >
        <div className="item-box flex-box-start">
          {!!selectedRows?.length ? (
            <div style={{ marginRight: 8, lineHeight: '50px' }}>
              <Checkbox
                checked={selectedRows.includes(id)}
                onChange={(e: any) => {
                  if (e.target.checked) {
                    setSelectedRows((prev: any) => prev.concat(id));
                  } else {
                    setSelectedRows((prev: any) =>
                      prev.filter((i: any) => i !== id)
                    );
                  }
                }}
              />
            </div>
          ) : null}
          <div
            className={`item-icon flex-box-center`}  //${running ? styles.borderLoadingStyle : ''}
            style={running ? { backgroundColor: '#52c41a' } : {}}
          >
            <div>{_.toUpper(name?.slice(0, 4))}</div>
          </div>
          <div
            className="flex-box-column item-right"
            onClick={() => {
              if (userAuthList.includes('projects.modify')) {
                onModify(item);
              }
            }}
          >
            <div className="flex-box">
              <TooltipDiv
                className={`title `} //${running ? styles.titleRunning : ''}
              >
                {name}
              </TooltipDiv>
              <div className="item-id">{id}</div>
            </div>
            <div className="flex-box" style={{ marginTop: 4 }}>
              <div className="time">
                {moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </div>
              <div className="description">
                <TooltipDiv>{plugin_dir || plugin_path}</TooltipDiv>
              </div>
            </div>
          </div>
          <div className="item-operation flex-box">
            {(operations || [])?.map?.((opera: any, index: number) => {
              const { key, label, icon, describtion, click, disabled } = opera;
              if (!userAuthList.includes(`projects.${key}`)) {
                return null;
              }
              return disabled ? (
                <span key={`operation-${key}`} className="greyColorStyle">
                  {label}
                </span>
              ) : (
                <a key={`operation-${key}`} onClick={() => click(item)}>
                  {label}
                </a>
              );
            })}
            <a
              key={`operation-log`}
              onClick={() => {
                console.log('要打开的日志路径地址：', logSavePath);
                openFolder(`${logSavePath}\\`);
              }}
            >
              日志
            </a>
          </div>
        </div>
      </Dropdown>
      {
        // 历史记录
        historyVisible ? (
          <Modal
            title={`历史记录-${historyVisible}`}
            // width="calc(100vw - 48px)"
            wrapClassName={'project-history-modal'}
            centered
            open={!!historyVisible}
            maskClosable={false}
            onCancel={() => setHistoryVisible('')}
            footer={null}
            getContainer={false}
          >
            <div className="plugin-manager-modal-body">
              <BasicTable
                className="plugin-list-table"
                columns={columns}
                pagination={null}
                dataSource={historyList}
                rowKey={(record: any) => {
                  return record?.createdAt;
                }}
              />
            </div>
          </Modal>
        ) : null
      }
      {
        // 节点状态
        stateVisible ? (
          <Modal
            title={
              <div className="flex-box" style={{ gap: '24px' }}>
                节点状态-{stateVisible}
                <Button
                  onClick={() => {
                    // 创建一个包含数据的工作簿
                    const workbook = XLSX.utils.book_new();
                    const worksheet = XLSX.utils.json_to_sheet(
                      stateList?.map?.((item: any) => {
                        const { name, pid, cpu, mem } = item;
                        return {
                          进程ID: pid,
                          节点名称: name,
                          CPU: cpu,
                          内存: mem,
                        };
                      })
                    );
                    // 将工作表添加到工作簿中
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                    // 导出工作簿为 Excel 文件
                    XLSX.writeFile(
                      workbook,
                      `${stateVisible}-节点状态信息.xlsx`
                    );
                  }}
                >
                  导出Excel
                </Button>
              </div>
            }
            width="calc(100vw - 48px)"
            wrapClassName={'plugin-manager-modal'}
            centered
            open={!!stateVisible}
            maskClosable={false}
            onCancel={() => setStateVisible('')}
            footer={null}
          >
            <div className="plugin-manager-modal-body">
              <BasicTable
                className="plugin-list-table"
                columns={stateColumns}
                pagination={null}
                dataSource={stateList}
                rowKey={(record: any) => {
                  return record?.name || guid();
                }}
              />
            </div>
          </Modal>
        ) : null
      }
      {
        // 重命名
        !!renameVisible ? (
          <Modal
            title={`重命名`}
            className="canvas-toolbar-setting-modal"
            centered
            open={!!renameVisible}
            maskClosable={false}
            onCancel={() => setRenameVisible(false)}
            onOk={() => {
              validateFields()
                .then((values) => {
                  const { name } = values;
                  onRename(name);
                })
                .catch((err = {}) => {
                  const { errorFields } = err;
                  if (_.isArray(errorFields)) {
                    message.error(`${errorFields[0]?.errors[0]} 是必填项`);
                  }
                });
            }}
          >
            <div className="canvas-toolbar-setting-modal-body">
              <Form
                form={form}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                // layout={'vertical'}
                scrollToFirstError
              >
                <Form.Item
                  name="name"
                  label="方案名称"
                  initialValue={name || ''}
                  rules={[{ required: true, message: '方案名称' }]}
                >
                  <Input placeholder="方案名称" autoFocus />
                </Form.Item>
              </Form>
            </div>
          </Modal>
        ) : null
      }
    </div>
  );
};
