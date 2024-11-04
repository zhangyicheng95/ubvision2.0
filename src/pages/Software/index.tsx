import React, { useEffect, useMemo, useState } from 'react';
import {
  message,
  Modal,
  Dropdown,
  Menu,
  Spin,
  Select,
  Button,
  Form,
  Input,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FormOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import * as _ from 'lodash-es';
import TooltipDiv from '@/components/TooltipDiv';
import PrimaryTitle from '@/components/PrimaryTitle';
import { chooseFile, chooseFolder, openFolder } from '@/api/native-path';
import styles from './index.module.less';
import ProjectApi from '@/api/project';
import { dpmDomain } from '@/utils/fetch';
import { getUserAuthList, guid } from '@/utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setLoading } from '@/redux/actions';

const { confirm } = Modal;
const userAuthList = getUserAuthList();

interface Props { }

const SoftwareRouter: React.FC<Props> = (props: any) => {
  const { loading } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState([]);
  const [softwareVisible, setSoftwareVisible] = useState(false);
  const [softwareModifyData, setSoftwareModifyData] = useState<any>({});
  const [softwareType, setSoftwareType] = useState('web');
  const [softwareFile, setSoftwareFile] = useState<any>({
    icon: '',
    value: ''
  });

  // 初始化列表
  const getList = () => {
    dispatch(setLoading(true));
    ProjectApi.getStorage('softwareStorage').then((res: any) => {
      if (!!res && res.code === 'SUCCESS' && !_.isEmpty(res.data)) {
        const { list = [] } = res.data;
        setDataList((list || [])?.map?.((item: any) => {
          return {
            ...item,
            id: guid(),
          }
        }));
      }
      dispatch(setLoading(false));
    });
  };
  // 进入页面默认拉取
  useEffect(() => {
    getList();
  }, []);

  // 添加监控模块
  const onAdd = () => {
    form.validateFields().then(values => {
      console.log(values);
      setDataList((prev: any) => {
        ProjectApi.addStorage('softwareStorage', {
          list: !_.isEmpty(softwareModifyData) ? prev?.map?.((item: any) => {
            if (item.id === softwareModifyData.id) {
              return {
                ...values,
                id: softwareModifyData.id
              }
            }
            return item;
          }) : prev.concat(values)
        }).then((res: any) => {
          getList();
        });
        setSoftwareVisible(false);
        setSoftwareModifyData({});
        return prev;
      });
    });
  };

  return (
    <div className={`${styles.softwarePage}`}>
      <PrimaryTitle
        title="第三方列表  Software"
      >
        {
          userAuthList.includes('software.new') ?
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                form.resetFields();
                form.setFieldsValue({
                  type: 'web'
                });
                setSoftwareFile({
                  icon: '',
                  value: ''
                });
                setSoftwareVisible(true);
              }}
            >
              添加软件
            </Button>
            : null
        }
      </PrimaryTitle>
      <div className="alert-page-body scrollbar-style">
        {
          useMemo(() => {
            if (!userAuthList.includes('software.list')) {
              return null;
            };
            return (dataList || [])?.map?.((item: any, index: number) => {
              return (
                <SoftwareItem
                  key={`software-${index}`}
                  item={item}
                  setDataList={setDataList}
                  getList={getList}
                  setSoftwareModifyData={setSoftwareModifyData}
                  setSoftwareVisible={setSoftwareVisible}
                  setSoftwareType={setSoftwareType}
                  setSoftwareFile={setSoftwareFile}
                  form={form}
                />
              );
            });
          }, [dataList])
        }
      </div>

      {
        // 添加第三方软件
        softwareVisible ?
          <Modal
            title="添加第三方软件"
            wrapClassName={"plugin-manager-modal"}
            centered
            open={softwareVisible}
            maskClosable={false}
            destroyOnClose
            onCancel={() => {
              form.resetFields();
              setSoftwareVisible(false);
              setSoftwareModifyData({});
            }}
            onOk={() => onAdd()}
          >
            <div className="plugin-manager-modal-body">
              <Form form={form} scrollToFirstError>
                <Form.Item
                  name={'type'}
                  label="软件类型"
                  rules={[{ required: true, message: '软件类型' }]}
                >
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    options={[
                      { label: 'web页面', value: 'web' },
                      { label: '客户端', value: 'electron' }
                    ]?.map?.((item: any) => {
                      const { label, value } = item;
                      return {
                        label: label,
                        value: value,
                        key: value,
                      }
                    })}
                    placeholder="软件类型"
                    onChange={(e: any) => setSoftwareType(e)}
                  />
                </Form.Item>
                {
                  softwareType === 'web' ?
                    <Form.Item
                      name={'value'}
                      label="软件链接"
                      rules={[{ required: false, message: '软件链接' }]}
                    >
                      <Input />
                    </Form.Item>
                    :
                    <Form.Item
                      name={'value'}
                      label="软件链接"
                      rules={[{ required: false, message: '软件链接' }]}
                    >
                      <div>
                        {
                          softwareFile?.value ?
                            <div className="flex-box-justify-between">
                              <TooltipDiv title={softwareFile?.value}>
                                {softwareFile?.value}
                              </TooltipDiv>
                              <DeleteOutlined
                                className='upload-delete-icon'
                                onClick={() => setSoftwareFile((prev: any) => ({
                                  ...prev,
                                  value: '',
                                }))}
                              />
                            </div>
                            : null
                        }
                        <Button onClick={() => {
                          chooseFile(
                            (res: any) => {
                              const result = (_.isArray(res) && res.length === 1) ? res[0] : res;
                              setSoftwareFile((prev: any) => ({
                                ...prev,
                                value: result,
                              }));
                              form.setFieldsValue({ value: result });
                            },
                            false,
                            { name: 'File', extensions: [] }
                          );
                        }}>
                          选择软件
                        </Button>
                      </div>
                    </Form.Item>
                }
                <Form.Item
                  name={'name'}
                  label="软件名称"
                  rules={[{ required: true, message: '软件名称' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={'alias'}
                  label="软件别名"
                  rules={[{ required: false, message: '软件别名' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={'icon'}
                  label="添加图标"
                  rules={[{ required: false, message: '图标' }]}
                >
                  <div>
                    {
                      softwareFile?.icon ?
                        <div className="flex-box-justify-between">
                          <TooltipDiv title={softwareFile?.icon}>
                            {softwareFile?.icon}
                          </TooltipDiv>
                          <DeleteOutlined
                            className='upload-delete-icon'
                            onClick={() => {
                              setSoftwareFile((prev: any) => ({
                                ...prev,
                                icon: '',
                              }));
                              form.setFieldsValue({ icon: '' });
                            }}
                          />
                        </div>
                        : null
                    }
                    <Button onClick={() => {
                      chooseFile(
                        (res: any) => {
                          const result = (_.isArray(res) && res.length === 1) ? res[0] : res;
                          setSoftwareFile((prev: any) => ({
                            ...prev,
                            icon: result,
                          }));
                          form.setFieldsValue({ icon: result });
                        },
                        false,
                        { name: 'File', extensions: ['jpg', 'jpeg', 'png', 'svg', 'ico'] }
                      );
                    }}>
                      选择图标
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </Modal>
          : null
      }
    </div >
  );
};

export default SoftwareRouter;

const SoftwareItem = (props: any) => {
  const { ipcRenderer }: any = window || {};
  const {
    item, setDataList, getList, setSoftwareVisible, setSoftwareModifyData,
    setSoftwareType, setSoftwareFile, form,
  } = props;
  const { id, type, value, alias, name, icon, collected } = item;
  // 点击打开新窗口
  const onClick = () => {
    if (type === 'web') {
      ipcRenderer.ipcCommTest('alert-open-browser', JSON.stringify({
        type: 'child',
        data: {
          ipUrl: dpmDomain,
          url: value,
          id
        }
      }));
    } else if (type === 'electron') {
      ipcRenderer.ipcCommTest('startup-software', value);
    }
  };
  // 编辑项目
  const onModify = () => {
    setSoftwareModifyData(item);
    setSoftwareVisible(true);
    setSoftwareType(type);
    setSoftwareFile({
      icon: icon,
      value: value,
    });
    form.setFieldsValue(item);
  };
  // 删除项目
  const onDelete = () => {
    setDataList((prev: any) => {
      ProjectApi.addStorage('softwareStorage', { list: prev.filter((i: any) => i.id !== id) }).then((res: any) => {
        getList();
      });
      return prev;
    });
  };
  const settingList: any = [
    userAuthList.includes('software.modify') ? {
      key: `modify-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        onModify();
      }}>
        <FormOutlined className="contextMenu-icon" />
        编辑
        <span className="contextMenu-text">Modify</span>
      </div>
    } : null,
    userAuthList.includes('software.delete') ? {
      key: `delete-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        onDelete();
      }}>
        <DeleteOutlined className="contextMenu-icon" />
        删除
        <span className="contextMenu-text">Delete</span>
      </div>
    } : null
  ]?.filter(Boolean);

  return (
    <Dropdown
      getPopupContainer={(triggerNode: any) => {
        return triggerNode.parentNode || document.body;
      }}
      menu={{ items: settingList }}
      trigger={['contextMenu']}
    >
      <div className={`flex-box item-box box-animation`}>
        <div className="flex-box item-box-child">
          <div className="flex-box item-box-child-left" onClick={(event) => {
            onClick();
            event.preventDefault(); // 阻止默认的关闭行为
            event?.stopPropagation();
          }}>
            <div className={`item-icon flex-box-center`}>
              {
                !!icon ?
                  <img
                    src={`${dpmDomain}file_browser${icon?.indexOf('/') === 0 ? '' : '/'}${icon}`}
                    alt="logo"
                  />
                  :
                  _.toUpper(name?.slice(0, 1))
              }
            </div>
            <div className="flex-box-column item-bottom">
              <div className="flex-box-justify-between">
                <TooltipDiv className={`title`}>
                  {alias || name || value}
                </TooltipDiv>
              </div>
            </div>
          </div>
          <div className="item-badge" onClick={(event) => {
            setDataList((prev: any) => {
              ProjectApi.addStorage('softwareStorage', {
                list: prev.map((i: any) => {
                  if (i.id === id) {
                    return {
                      ...i,
                      collected: !collected
                    }
                  }
                  return i;
                })
              }).then((res: any) => {
                getList();
              });
              return prev;
            });
            event.preventDefault(); // 阻止默认的关闭行为
            event?.stopPropagation();
          }}>
            {
              !!collected ?
                <StarFilled style={{ color: '#d4d403' }} />
                :
                <StarOutlined />
            }
          </div>
        </div>
      </div>
    </Dropdown>
  );
};
