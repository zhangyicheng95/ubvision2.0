import React, { useEffect, useMemo, useState } from 'react';
import { message, Dropdown, Popover, Select, Modal, Form, Switch } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
  PoweroffOutlined,
  SettingOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import * as _ from 'lodash-es';
import TooltipDiv from '@/components/TooltipDiv';
import PrimaryTitle from '@/components/PrimaryTitle';
import { getParams, updateParams } from '@/services/flowEditor';
import styles from './index.module.less';
import { dpmDomain } from '@/utils/fetch';
import { copyUrlToClipBoard, getUserAuthList } from '@/utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

const userAuthList = getUserAuthList();

interface Props { }

const AlertRouter: React.FC<Props> = (props: any) => {
  const { projectList, loopProjectStatusFun } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState([]);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [editVisible, setEditVisible] = useState<any>(null);

  // 进入页面默认拉取
  useEffect(() => {
    setDataList(projectList)

    return () => {
      setDataList([]);
    }
  }, [JSON.stringify(projectList)]);

  // 模糊查询
  const onSearch = (val: any) => {
    try {
      setDataList(
        (dataList || []).filter(
          (i: any) => !!i?.alertShow && i?.name?.indexOf(val) > -1
        )
      );
    } catch (e) { }
  };
  // 添加监控模块
  const onAdd = (id: string) => {
    try {
      const result: any = (dataList || []).filter(
        (i: any) => i.id === id
      )?.[0];
      if (!!result) {
        updateParams(id, { ...result, alertShow: true }).then((res) => {
          if (!!res && res.code === 'SUCCESS') {
            const result: any = (dataList || [])?.map?.((item: any) => {
              if (item.id === id) {
                return res.data;
              }
              return item;
            });
            setDataList(result);
            loopProjectStatusFun(result);
          } else {
            message.error(res?.message || '接口异常');
          }
        });
      }
    } catch (e) { }
    setPopoverVisible(false);
  };

  return (
    <div className={`${styles.alertPage}`}>
      <PrimaryTitle
        title="监控列表  Monitor"
        onSearch={onSearch}
      ></PrimaryTitle>
      <div className="alert-page-body">
        {
          !userAuthList.includes('monitor.add') ? null :
            <Popover
              placement="bottom"
              title={'添加监控窗口'}
              trigger="click"
              destroyTooltipOnHide={true}
              arrow={{ pointAtCenter: true }}
              open={popoverVisible}
              content={
                <Select
                  style={{ width: 250 }}
                  onChange={(value) => onAdd(value)}
                  onBlur={() => setPopoverVisible(false)}
                >
                  {(dataList || [])?.map?.(
                    (item: any, index: number) => {
                      const { id, alias, name, alertShow } = item;
                      return (
                        <Select.Option
                          disabled={!!alertShow}
                          key={id}
                          value={id}
                        >
                          {alias || name}
                        </Select.Option>
                      );
                    }
                  )}
                </Select>
              }
            >
              <div
                className="item-box box-animation add-box"
                onClick={(e) => {
                  setPopoverVisible(true);
                  e.preventDefault(); // 阻止默认的关闭行为
                  e?.stopPropagation();
                }}
              >
                <div className="item-box-child flex-box-center">
                  <PlusOutlined />
                </div>
              </div>
            </Popover>
        }
        {useMemo(() => {
          if (!userAuthList.includes('monitor.list')) {
            return null;
          }
          return <div>
            {
              (dataList || [])?.map?.((item: any, index: number) => {
                const { id, alertShow } = item;
                if (!alertShow) return null;
                return (
                  <AlertItem
                    key={id}
                    item={item}
                    setDataList={setDataList}
                    loopGetStatus={loopProjectStatusFun}
                    setEditVisible={setEditVisible}
                    form={form}
                  />
                );
              })
            }
            {
              // 编辑配置
              !!editVisible ?
                <Modal
                  title={`编辑-${editVisible?.alias || editVisible?.name}`}
                  wrapClassName={"plugin-manager-modal"}
                  centered
                  open={!!editVisible}
                  maskClosable={false}
                  onCancel={() => {
                    form.resetFields();
                    setEditVisible(null);
                  }}
                  onOk={() => {
                    form.validateFields().then(values => {
                      getParams(editVisible.id).then((params) => {
                        if (params && params.code === 'SUCCESS') {
                          updateParams(editVisible.id, {
                            ...params.data,
                            contentData: Object.assign(
                              params.data?.contentData,
                              values
                            ),
                          }).then((res: any) => {
                            if (res && res.code === 'SUCCESS') {
                              setDataList((prev: any) => {
                                const result = (prev || [])?.map?.((i: any) => {
                                  if (i.id === res.data.id) {
                                    return res.data;
                                  }
                                  return i;
                                });
                                loopProjectStatusFun(result);
                                return result;
                              });
                            } else {
                              message.error(res?.msg || res?.message || '接口异常');
                            }
                          });
                        } else {
                          message.error(params?.msg || params?.message || '接口异常');
                        }
                      });
                      form.resetFields();
                      setEditVisible(null);
                    });
                  }}
                  getContainer={false}
                >
                  <div className="plugin-manager-modal-body">
                    <Form form={form} scrollToFirstError>
                      <Form.Item
                        name={'showLogo'}
                        label="展示logo"
                        valuePropName="checked"
                        initialValue={editVisible?.contentData?.showLogo}
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={'showHeader'}
                        label="展示头部"
                        valuePropName="checked"
                        initialValue={editVisible?.contentData?.showHeader}
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={'showFooter'}
                        label="展示底部"
                        valuePropName="checked"
                        initialValue={editVisible?.contentData?.showFooter}
                      >
                        <Switch />
                      </Form.Item>
                      {
                        userAuthList.includes('monitor.changeLogo') ?
                          <Form.Item
                            name={'changeLogo'}
                            label="允许更换logo"
                            valuePropName="checked"
                            initialValue={editVisible?.contentData?.changeLogo}
                          >
                            <Switch />
                          </Form.Item>
                          : null
                      }
                    </Form>
                  </div>
                </Modal>
                : null
            }
          </div>
        }, [dataList, JSON.stringify(editVisible?.contentData)])}
      </div>
    </div>
  );
};

export default AlertRouter;

const AlertItem = (props: any) => {
  const { ipcRenderer }: any = window || {};
  const { item, setDataList, loopGetStatus, setEditVisible, form } = props;
  const { name, id, running, ifOnStartUp, contentData, updatedAt } = item;

  // 获取是否存在快速启动列表中
  useEffect(() => {
    ipcRenderer.on('alert-read-startUp-reply', function (res: any) {
      setDataList((prev: any) =>
        (prev || [])?.map?.((i: any) => {
          if (i.id === res.id) {
            return {
              ...i,
              ifOnStartUp: !!res && res.success,
            };
          }
          return i;
        })
      );
    });
    ipcRenderer.ipcCommTest(
      'alert-read-startUp',
      JSON.stringify({
        id,
        name: `${name}.lnk`,
      })
    );
  }, [id]);
  // 点击打开新窗口
  const onClick = (item: any) => {
    const { id } = item;
    ipcRenderer.ipcCommTest(
      'alert-open-browser',
      JSON.stringify({
        type: 'child',
        data: {
          type: 'child',
          ipUrl: dpmDomain,
          id,
        },
      })
    );
  };
  // 添加到桌面快捷方式
  const addToDesk = (item: any) => {
    const { id, name } = item;
    ipcRenderer.ipcCommTest(
      'alert-make-browser',
      JSON.stringify({
        id,
        name: `${name}.lnk`,
      })
    );
  };
  // 添加到快速启动列表
  const addToStartUp = (item: any) => {
    const { id, name } = item;
    ipcRenderer.ipcCommTest(
      'alert-add-startUp',
      JSON.stringify({
        id,
        name: `${name}.lnk`,
      })
    );
  };
  // 取消快速启动
  const trashStartUp = (item: any) => {
    const { id, name } = item;
    ipcRenderer.ipcCommTest(
      'alert-delete-startUp',
      JSON.stringify({
        id,
        name: `${name}.lnk`,
      })
    );
  };
  // 删除项目
  const onDelete = (item: any) => {
    const { id } = item;
    try {
      updateParams(id, { ...item, alertShow: false }).then((res) => {
        if (!!res && res.code === 'SUCCESS') {
          setDataList((prev: any) => {
            const result = (prev || [])?.map?.((item: any) => {
              if (item.id === id) {
                return res.data;
              }
              return item;
            });
            loopGetStatus(result);
            return result;
          });
        } else {
          message.error(res?.message || '接口异常');
        }
      });
    } catch (e) { }
  };
  // 复制访问链接
  const copyUrlLink = (item: any) => {
    const { id } = item;
    const ip = process?.env?.IPAddress;
    const url = `http://${ip}:5001/index.html#/home?ipUrl=${ip}:8866&id=${id}&timestamp=${+new Date()}`;
    copyUrlToClipBoard(url);
  };
  const settingList: any = [
    userAuthList.includes('monitor.addDesk') ? {
      key: `add-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        addToDesk(item);
      }}>
        <AppstoreAddOutlined className="contextMenu-icon" />
        创建桌面快捷方式
        <span className="contextMenu-text">Add To Desk</span>
      </div>
    } : null,
    userAuthList.includes('monitor.addSelfStart') ? {
      key: `modify-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        if (ifOnStartUp) {
          trashStartUp(item);
        } else {
          addToStartUp(item);
        }
      }}>
        <PoweroffOutlined className="contextMenu-icon" />
        {`${ifOnStartUp ? '取消' : '添加'}开机自启动`}
        <span className="contextMenu-text">Self Starting</span>
      </div>
    } : null,
    userAuthList.includes('monitor.copyUrl') ? {
      key: `copyUrl-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        copyUrlLink(item);
      }}>
        <CopyOutlined className="contextMenu-icon" />
        复制访问链接
        <span className="contextMenu-text">Copy URL</span>
      </div>
    } : null,
    { type: 'divider' },
    userAuthList.includes('monitor.delete') ? {
      key: `delete-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        onDelete(item);
      }}>
        <DeleteOutlined className="contextMenu-icon" />
        删除
        <span className="contextMenu-text">CCD Delete</span>
      </div>
    } : null,
    userAuthList.includes('monitor.headerOperation') ? {
      key: `show-logo-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        setEditVisible(item);
        setTimeout(() => {
          form.setFieldsValue({
            showLogo: !!item?.contentData?.showLogo,
            showHeader: !!item?.contentData?.showHeader,
            showFooter: !!item?.contentData?.showFooter,
            changeLogo: !!item?.contentData?.changeLogo
          });
        }, 200);
      }}>
        <SettingOutlined className="contextMenu-icon" />
        编辑
        <span className="contextMenu-text">CCD Edit</span>
      </div>
    } : null
  ]?.filter(Boolean);

  return (
    <Dropdown
      getPopupContainer={(triggerNode: any) => {
        return triggerNode?.parentNode || document.body;
      }}
      menu={{ items: settingList }}
      trigger={['contextMenu']}
    >
      <div
        // className={`item-box ${running ? styles.runningBorder : 'box-animation'}`}
        className={`item-box box-animation`}
        onClick={() => {
          return onClick(item);
        }}
      >
        <div className="item-box-child flex-box-column">
          <div
            className={`item-icon flex-box-center`}
            style={running ? { backgroundColor: '#52c41a' } : {}}
          >
            {_.toUpper(name?.slice(0, 1))}
          </div>
          <div className="flex-box-column item-bottom">
            <div className="flex-box-justify-between">
              <TooltipDiv
                className={`title`} // ${running ? styles.titleRunning : ''}
              >
                {name}
              </TooltipDiv>
              {running ? <div className="item-badge" /> : null}
            </div>
            <div className="time">
              {moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>
      </div>
    </Dropdown>
  );
};
