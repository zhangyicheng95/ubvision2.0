import React, {
  Fragment,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { message, Dropdown, Menu, Spin, Popover, Select } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
  PoweroffOutlined,
  AreaChartOutlined,
  InstagramOutlined,
  CopyOutlined,
  BorderTopOutlined,
  BorderBottomOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import * as _ from 'lodash-es';
import TooltipDiv from '@/components/TooltipDiv';
import PrimaryTitle from '@/components/PrimaryTitle';
import {
  getDataList,
  getListStatusService,
  getParams,
  updateParams,
} from '@/services/flowEditor';
import styles from './index.module.less';
import { dpmDomain } from '@/utils/fetch';
import { copyUrlToClipBoard, getUserAuthList } from '@/utils/utils';

const userAuthList = getUserAuthList();

interface Props { }

const AlertRouter: React.FC<Props> = (props: any) => {
  const timerRef = useRef<any>();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [hasInit, setHasInit] = useState(false);

  // 初始化列表
  const getList = () => {
    setLoading(true);
    // ProjectApi.list().then((res) => {
    getDataList().then((res: any) => {
      if (!!res && res.code === 'SUCCESS') {
        res.data = res.data
          ?.map?.((item: any) => {
            let result = item;
            if (!_.isBoolean(result.contentData?.showHeader)) {
              result = {
                ...result,
                contentData: {
                  ...result.contentData,
                  showHeader: true,
                },
              };
            };
            if (!_.isBoolean(result.contentData?.showLogo)) {
              result = {
                ...result,
                contentData: {
                  ...result.contentData,
                  showLogo: true,
                },
              };
            };
            if (!_.isBoolean(result.contentData?.showFooter)) {
              result = {
                ...result,
                contentData: {
                  ...result.contentData,
                  showFooter: true,
                },
              };
            };
            return result;
          })
          .sort((a: any, b: any) => {
            return b.updatedAt - a.updatedAt;
          });
        setDataList(res.data);
        const resultStore = res.data?.map?.((i: any) => ({
          ...i,
          disabled: !!i?.alertShow,
        }));

        loopGetStatus(resultStore);
      } else {
        message.error(res?.message || '接口异常');
      }
      setLoading(false);
    });
  };
  // 进入页面默认拉取
  useEffect(() => {
    setHasInit(true);
    getList();
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      setHasInit(false);
    };
  }, []);
  // 轮循查询每个方案启动状态
  const loopGetStatus = (list: any) => {
    if (list.length) {
      getListStatusService().then((res: any) => {
        if (!!res && res.code === 'SUCCESS') {
          const result = (list || [])?.map?.((item: any) => {
            return {
              ...item,
              running: _.isObject(res?.data) && !_.isEmpty(res?.data[item.id]),
              disabled: !!item.alertShow,
            };
          });
          setDataList((prev: any) => {
            return prev?.map?.((item: any) => {
              return {
                ...item,
                running:
                  _.isObject(res?.data) && !_.isEmpty(res?.data[item.id]),
              };
            });
          });
        } else {
          message.error(res?.message || '接口异常');
        }
        timerRef.current && clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setHasInit((prev: any) => {
            if (prev) {
              loopGetStatus(list);
            }
            return prev;
          });
        }, 2500);
      });
    }
  };
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
                return {
                  ...res.data,
                  disabled: !!item.alertShow,
                };
              }
              return item;
            });
            setDataList(result);
            loopGetStatus(result);
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
      <Spin spinning={loading} tip={'加载中...'}>
        <PrimaryTitle
          title="监控列表  Monitor"
          onSearch={onSearch}
        ></PrimaryTitle>
        <div className="alert-page-body scrollbar-style">
          {useMemo(() => {
            if (!userAuthList.includes('monitor.add')) {
              return null;
            }
            return (
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
                        const { id, alias, name, disabled } = item;
                        return (
                          <Select.Option
                            disabled={!!disabled}
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
            );
          }, [popoverVisible, dataList])}
          {useMemo(() => {
            if (!userAuthList.includes('monitor.list')) {
              return null;
            }
            return (dataList || [])?.map?.((item: any, index: number) => {
              const { id, alertShow } = item;
              if (!alertShow) return null;
              return (
                <AlertItem
                  key={id}
                  item={item}
                  setDataList={setDataList}
                  loopGetStatus={loopGetStatus}
                />
              );
            });
          }, [dataList])}
        </div>
      </Spin>
    </div>
  );
};

export default AlertRouter;

const AlertItem = (props: any) => {
  const { ipcRenderer }: any = window || {};
  const { item, setDataList, loopGetStatus } = props;
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
          url:
            process.env.NODE_ENV === 'development'
              ? 'localhost:8000'
              : JSON.parse(localStorage.getItem('general_setting') || '{}')
                ?.alert_url_path || 'localhost:5001/index.html',
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
  // 显示/隐藏logo
  const showCCDLogo = (item: any) => {
    const { id } = item;
    getParams(id).then((params) => {
      if (params && params.code === 'SUCCESS') {
        updateParams(id, {
          ...params.data,
          contentData: Object.assign(
            params.data?.contentData,
            _.isBoolean(params.data?.contentData.showHeader)
              ? {}
              : {
                showHeader: true,
              },
            {
              showLogo: !params.data?.contentData?.showLogo,
            }
          ),
        }).then((res: any) => {
          if (res && res.code === 'SUCCESS') {
            setDataList((prev: any) =>
              (prev || [])?.map?.((i: any) => {
                if (i.id === res.data.id) {
                  return res.data;
                }
                return i;
              })
            );
          } else {
            message.error(res?.msg || res?.message || '接口异常');
          }
        });
      } else {
        message.error(params?.msg || params?.message || '接口异常');
      }
    });
  };
  // 显示/隐藏Header
  const showCCDHeader = (item: any) => {
    const { id } = item;
    getParams(id).then((params) => {
      if (params && params.code === 'SUCCESS') {
        updateParams(id, {
          ...params.data,
          contentData: Object.assign(
            params.data?.contentData,
            _.isBoolean(params.data?.contentData.showLogo)
              ? {}
              : {
                showLogo: true,
              },
            {
              showHeader: !params.data?.contentData?.showHeader,
            }
          ),
        }).then((res: any) => {
          if (res && res.code === 'SUCCESS') {
            setDataList((prev: any) =>
              (prev || [])?.map?.((i: any) => {
                if (i.id === res.data.id) {
                  return res.data;
                }
                return i;
              })
            );
          } else {
            message.error(res?.msg || res?.message || '接口异常');
          }
        });
      } else {
        message.error(params?.msg || params?.message || '接口异常');
      }
    });
  };
  // 显示/隐藏Footer
  const showCCDFooter = (item: any) => {
    const { id } = item;
    getParams(id).then((params) => {
      if (params && params.code === 'SUCCESS') {
        updateParams(id, {
          ...params.data,
          contentData: Object.assign(
            params.data?.contentData,
            {
              showFooter: !params.data?.contentData?.showFooter,
            }
          ),
        }).then((res: any) => {
          if (res && res.code === 'SUCCESS') {
            setDataList((prev: any) =>
              (prev || [])?.map?.((i: any) => {
                if (i.id === res.data.id) {
                  return res.data;
                }
                return i;
              })
            );
          } else {
            message.error(res?.msg || res?.message || '接口异常');
          }
        });
      } else {
        message.error(params?.msg || params?.message || '接口异常');
      }
    });
  };
  // 允许/禁止更换logo
  const allowChangeLogo = (item: any) => {
    const { id } = item;
    getParams(id).then((params) => {
      if (params && params.code === 'SUCCESS') {
        updateParams(id, {
          ...params.data,
          contentData: Object.assign(params.data?.contentData, {
            changeLogo: !params.data?.contentData?.changeLogo,
          }),
        }).then((res: any) => {
          if (res && res.code === 'SUCCESS') {
            setDataList((prev: any) =>
              (prev || [])?.map?.((i: any) => {
                if (i.id === res.data.id) {
                  return res.data;
                }
                return i;
              })
            );
          } else {
            message.error(res?.msg || res?.message || '接口异常');
          }
        });
      } else {
        message.error(params?.msg || params?.message || '接口异常');
      }
    });
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
    userAuthList.includes('monitor.delete') ? {
      key: `delete-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        onDelete(item);
      }}>
        <DeleteOutlined className="contextMenu-icon" />
        删除
        <span className="contextMenu-text">Delete</span>
      </div>
    } : null,
    { type: 'divider' },
    ...userAuthList.includes('monitor.headerOperation') ? [
      {
        key: `show-logo-${id}`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          showCCDLogo(item);
        }}>
          <AreaChartOutlined className="contextMenu-icon" />
          {`${contentData?.showLogo ? '隐藏' : '展示'}logo`}
          <span className="contextMenu-text">CCD Logo</span>
        </div>
      },
      {
        key: `show-header-${id}`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          showCCDHeader(item);
        }}>
          <BorderTopOutlined className="contextMenu-icon" />
          {`${!!contentData?.showHeader ? '隐藏' : '展示'}头部`}
          <span className="contextMenu-text">CCD Header</span>
        </div>
      },
      {
        key: `show-footer-${id}`,
        label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
          showCCDLogo(item);
        }}>
          <BorderBottomOutlined className="contextMenu-icon" />
          {`${!!contentData?.showFooter ? '隐藏' : '展示'}底部`}
          <span className="contextMenu-text">CCD Footer</span>
        </div>
      },
      { type: 'divider' }
    ] : [],
    userAuthList.includes('monitor.changeLogo') ? {
      key: `changeLogo-${id}`,
      label: <div className='flex-box-justify-between dropdown-box' onClick={() => {
        allowChangeLogo(item);
      }}>
        <InstagramOutlined className="contextMenu-icon" />
        {`${contentData?.changeLogo ? '禁止' : '允许'}更换logo`}
        <span className="contextMenu-text">Change Logo</span>
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
