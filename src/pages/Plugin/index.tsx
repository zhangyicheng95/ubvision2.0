import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete, Dropdown, Menu, Popconfirm, Badge, Upload, Modal } from 'antd';
import {
  DeleteOutlined, CloudDownloadOutlined, FieldTimeOutlined, FolderAddOutlined, FolderOpenOutlined, FolderOutlined, LaptopOutlined, PlusOutlined, ProjectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { login } from '@/services/auth';
import { cryptoEncryption, downFileFun, formatJson, getUserAuthList, intersectionABList } from '@/utils/utils';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import PrimaryTitle from '@/components/PrimaryTitle';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setLoading, setPluginList } from '@/redux/actions';
import { addPlugin, deletePlugin, getPluginList } from '@/services/flowPlugin';
import BasicTable from '@/components/BasicTable';
import moment from 'moment';
import TooltipDiv from '@/components/TooltipDiv';
import BasicConfirm from '@/components/BasicConfirm';
import { formatPlugin } from '@/common/globalConstants';
import JSZip from 'jszip';
import pluginInfo from '@/assets/pluginJSON/pluginInfo.json';

const { confirm } = Modal;
interface Props { }

const PluginPage: React.FC<Props> = (props: any) => {
  const { projectList, pluginList } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userAuthList = getUserAuthList();

  const uploadPluginRef = useRef<any>([]);
  const ifAllcover = useRef<any>(null);
  const [searchVal, setSearchVal] = useState('');
  const [selectedRows, setSelectedRows] = useState<object[]>([]);

  const usedInProject = useMemo(() => {
    const res = (projectList || [])?.reduce((pre: any, cen: any) => {
      return pre.concat((cen.flowData.nodes || [])?.map((node: any) => node.name));
    }, []);
    return Array.from(new Set(res));
  }, [projectList]);
  // 获取插件列表
  const getPluginListFun = () => {
    dispatch(setLoading(true));
    getPluginList().then((res: any) => {
      if (!!res && res.code === 'SUCCESS') {
        dispatch(setPluginList(res.data?.sort((a: any, b: any) => b.updatedAt - a.updatedAt)));
      } else {
        message.error(res?.message || '接口异常');
      };
      dispatch(setLoading(false));
    });
  };
  // 初始化列表
  useEffect(() => {
    getPluginListFun();
  }, []);
  // 批量操作
  const settingList: any = [
    userAuthList.includes('plugins.delete') ? {
      key: `delete`,
      label: <Button
        icon={<DeleteOutlined />}
        type="primary"
        style={{ width: '100%' }}
        onClick={() => {
          dispatch(setLoading(true));
          const onDelete = (item: any, index: number) => {
            const { id } = item;
            deletePlugin(id).then((res) => {
              if (!!res && res.code === 'SUCCESS') {
                if (!!selectedRows[index + 1]) {
                  onDelete(selectedRows[index + 1], index + 1);
                } else {
                  getPluginListFun?.();
                  setSelectedRows([]);
                }
              } else {
                getPluginListFun?.();
                setSelectedRows([]);
              }
            });
          };
          onDelete(selectedRows[0], 0);
        }}
      >
        批量删除
      </Button>
    } : null,
    userAuthList.includes('plugins.export') ? {
      key: `export`,
      label: <Button
        icon={<CloudDownloadOutlined />}
        type="primary"
        style={{ width: '100%' }}
        onClick={() => {
          var zip = new JSZip();
          selectedRows?.forEach((record: any) => {
            const { createdAt, updatedAt, id, ...rest } = record;
            zip.file(`${record?.alias || record?.name}.json`, formatJson(rest));
          });
          zip.generateAsync({ type: 'blob' }).then((content: any) => {
            downFileFun(content, '插件列表.zip');
            setSelectedRows([]);
          });
        }}
      >
        批量导出
      </Button>
    } : {},
    { type: 'divider' },
  ]?.filter(Boolean);
  // 列表表头
  const columns = [
    {
      title: '插件别名',
      dataIndex: 'alias',
      key: 'alias',
      render: (text: any, record: any) => {
        return <TooltipDiv title={text}>
          {text}
        </TooltipDiv>;
      },
    },
    {
      title: '插件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => {
        return <TooltipDiv content={text} >
          {usedInProject?.includes(text) ? <Badge color={'green'} style={{ marginRight: 4 }} /> : null}
          {text}
        </TooltipDiv>;
      },
    },
    {
      title: '所属分组',
      dataIndex: 'category',
      key: 'alias',
      width: '88px',
      render: (text: any) => {
        return <TooltipDiv content={text}>{text}</TooltipDiv>;
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: '72px',
      render: (text: any) => {
        return <TooltipDiv content={text}>{text}</TooltipDiv>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: any) => {
        return <TooltipDiv content={text}>{text}</TooltipDiv>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '178px',
      render: (text: any) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: (a: any, b: any) => a.updatedAt - b.updatedAt,
    },
    {
      title: '处理人',
      dataIndex: 'author',
      key: 'author',
      width: '74px',
      render: (text: any) => {
        return <TooltipDiv content={text}>{text}</TooltipDiv>;
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '143px',
      render: (text: any, record: any) => {
        const { id, name, createdAt, updatedAt } = record;
        if (
          !userAuthList.includes('plugins.modify') &&
          !userAuthList.includes('plugins.delete') &&
          !userAuthList.includes('plugins.export')
        ) {
          return '-';
        }
        return (
          <div className='flex-box'>
            {
              userAuthList.includes('plugins.modify') ?
                <Fragment>
                  <span className='nameStyle' onClick={() => {
                    navigate(`/plugin/modify/${id}`);
                  }}>编辑</span>
                  {
                    (userAuthList.includes('plugins.delete') || userAuthList.includes('plugins.export')) ?
                      <span className="operation-line">|</span>
                      : null
                  }
                </Fragment>
                : null
            }
            {
              userAuthList.includes('plugins.delete') ?
                <Fragment>
                  {
                    usedInProject?.includes(name) ?
                      <TooltipDiv className='greyColorStyle' content="该插件在方案使用中，不允许删除">删除</TooltipDiv>
                      :
                      <Popconfirm
                        title="确定删除?"
                        onConfirm={() => {
                          const { id } = record;
                          deletePlugin(id).then((res) => {
                            if (!!res && res.code === 'SUCCESS') {
                              message.success('删除成功');
                              getPluginListFun();
                            } else {
                              message.error(res?.message || '接口异常');
                            }
                          });
                        }}
                      >
                        <span className='nameStyle'>删除</span>
                      </Popconfirm>
                  }
                  {
                    userAuthList.includes('plugins.export') ?
                      <span className="operation-line">|</span>
                      : null
                  }
                </Fragment>
                : null
            }
            {
              userAuthList.includes('plugins.export') ?
                <span className='nameStyle'
                  onClick={() => {
                    downFileFun(
                      JSON.stringify({
                        ..._.omit(record, 'id'),
                        createdAt: moment(new Date(createdAt)).format('YYYY-MM-DD HH:mm:ss'),
                        updatedAt: moment(new Date(updatedAt)).format('YYYY-MM-DD HH:mm:ss')
                      }),
                      `info.json`
                    );
                  }}
                >
                  导出
                </span>
                : null
            }
          </div>
        );
      },
    },
  ];
  // 上传完插件
  const addPluginCancel = () => {
    // 处理完后，把该数组清空，用于下一次的上传对比
    uploadPluginRef.current = [];
    ifAllcover.current = false;
    message.success('插件导入成功');
    getPluginListFun();
  };
  // 选择插件
  const pluginUploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: true,
    beforeUpload(file: any, fileList: object[]) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          const item = JSON.parse(result);
          const { name, version, alias, config = {} } = item;
          uploadPluginRef.current.push(item);
        } catch (err) {
          message.error(`${file.name}文件格式错误，请修改后上传。`);
          uploadPluginRef.current.push(null);
        };
        if (uploadPluginRef.current?.length === fileList?.length) {
          // 集齐所有用户上传的文件
          const sameList = intersectionABList(pluginList, uploadPluginRef.current, 'name');
          if (uploadPluginRef.current?.length !== sameList?.length) {
            // 上传的文件列表中，既有需要覆盖的，也有需要单独添加的，在这里处理单独添加的
            function addPluginFun(index: number) {
              const item1 = uploadPluginRef.current?.filter((i: any) => i.name === sameList[index])?.[0];
              if (!!item1) {
                addPluginFun(index + 1);
                return;
              }
              const item = uploadPluginRef.current[index];
              if (!item) {
                if (!sameList?.length) {
                  addPluginCancel();
                }
                return;
              };
              const param = formatPlugin(item);
              addPlugin(param).then(() => {
                addPluginFun(index + 1);
              });
            };
            addPluginFun(0);
          };
          if (!!sameList?.length) {
            // 有需要覆盖更新的
            function uploadPluginFun(index: number) {
              if (!sameList[index]) {
                addPluginCancel();
                return;
              };
              const item = uploadPluginRef.current?.filter((i: any) => i.name === sameList[index])?.[0];
              if (!item) {
                return;
              }
              const { alias, name } = item;
              const { id } = pluginList?.filter((i: any) => i.name === sameList[index])?.[0] || {};
              if (ifAllcover.current) {
                deletePlugin(id).then((res) => {
                  if (!!res && res.code === 'SUCCESS') {
                    const param = formatPlugin(item);
                    addPlugin(param).then(() => {
                      uploadPluginFun(index + 1);
                    });
                  } else {
                    message.error(res?.message || '接口异常');
                  };
                });
              } else {
                confirm({
                  title: `${alias || name} 已存在`,
                  content: sameList?.length > 1 ? (
                    <BasicConfirm
                      ifAllOk
                      ifAllOkClick={(e: boolean) => {
                        ifAllcover.current = e;
                      }}
                    >
                      确认覆盖？
                    </BasicConfirm>
                  ) : null,
                  okText: '覆盖',
                  cancelText: '跳过',
                  onOk() {
                    deletePlugin(id).then((res) => {
                      if (!!res && res.code === 'SUCCESS') {
                        const param = formatPlugin(item);
                        addPlugin(param).then(() => {
                          uploadPluginFun(index + 1);
                        });
                      } else {
                        message.error(res?.message || '接口异常');
                      };
                    });
                  },
                  onCancel() {
                    if (ifAllcover.current) {
                      Modal.destroyAll();
                    }
                  },
                });
              };
            };
            uploadPluginFun(0);
          }
        };
      };
      return false;
    },
  };
  // 多选
  const rowSelection = {
    selectedRowKeys: selectedRows?.map((i: any) => i.id),
    onChange: (selectedRowKeys: string[], selectedRows: object[]) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: usedInProject?.includes(record.name),
      name: record.id,
    }),
  };

  return (
    <div className={styles.PluginPage}>
      <PrimaryTitle title="插件管理 Plugins" onSearch={(val: string) => setSearchVal(val)}>
        {userAuthList.includes('plugins.download') ? (
          <Button
            icon={<CloudDownloadOutlined />}
            type="primary"
            onClick={() => {
              downFileFun(formatJson(pluginInfo), '插件模板info.json');
            }}
          >
            下载模版
          </Button>
        ) : null}
        {userAuthList.includes('plugins.import') ?
          <Upload {...pluginUploadProps}>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                // ifAllcover.current = false;
                // chooseFile(
                //   (res: any, err) => {
                //     if (!!err) {
                //       message.error('格式错误或含有特殊字符');
                //     } else {
                //       setSelectedFiles(res);
                //     }
                //   },
                //   true,
                //   { name: 'File', extensions: ['json'] }
                // );
              }}
            >
              导入插件
            </Button>
          </Upload>
          : null}
        {
          ((userAuthList.includes('plugins.delete') ||
            userAuthList.includes('plugins.export')) && selectedRows.length) ? (
            <Dropdown
              getPopupContainer={(triggerNode: any) => {
                return triggerNode.parentNode || document.body;
              }}
              menu={{ items: settingList }}
            >
              <Button icon={<CloudDownloadOutlined />} type="primary">
                批量操作
              </Button>
            </Dropdown>
          ) : null
        }
      </PrimaryTitle>
      <div className="plugin-page-body">
        <BasicTable
          className="plugin-list-table"
          columns={columns}
          rowSelection={
            (
              !userAuthList.includes('plugins.modify') &&
              !userAuthList.includes('plugins.delete') &&
              !userAuthList.includes('plugins.export')
            )
              ?
              null
              : {
                ...rowSelection,
              }}
          pagination={null}
          dataSource={pluginList?.filter((i: any) => {
            return i.alias?.indexOf(searchVal) > -1 || i.name?.indexOf(searchVal) > -1
          })}
          rowKey={(record: any) => {
            return record?.id;
          }}
        />
      </div>
    </div>
  );
};

export default PluginPage;

