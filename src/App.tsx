import React, { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import '@/App.css';
import { Button, ConfigProvider, Form, Input, message, Modal, notification, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
// for date-picker i18n
import 'dayjs/locale/zh-cn';
import BasicLayout from '@/layouts/BasicLayout';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { copyUrlToClipBoard, cryptoDecrypt, cryptoEncryption, getLoginTime, GetQueryObj, getUserAuthList, getUserData, timeToString } from '@/utils/utils';
import * as _ from 'lodash-es';
import ProjectApi from '@/api/project';
import authWrapper from '@/components/authWrapper';
import LoginPage from '@/pages/Login';
import HomePage from '@/pages/Home';
import ProjectPage from '@/pages/Projects';
import AlertPage from '@/pages/Alert';
import FlowPage from '@/pages/Flow';
import PluginPage from '@/pages/Plugin';
import SoftwarePage from '@/pages/Software';
import SoftwareOpenPage from '@/pages/SoftwareOpen';
import AuthPage from '@/pages/Auth';
import CCDPage from '@/pages/CCD';
import MarkdownPage from '@/pages/Markdown';
import UserPage from '@/pages/UserInfo';
import SettingPage from '@/pages/Setting';
import CasePage from '@/pages/Home/Case';
import { notificationSetting, permissionRule } from '@/common/globalConstants';
import { getDataList, getListStatusService } from '@/services/flowEditor';
import { useDispatch } from 'react-redux';
import { getProjectList, loopProjectStatus, setLoading, setProjectList } from '@/redux/actions';
import PluginEditPage from './pages/Plugin/components/PluginEdit';
import { useReloadAfterStationary } from './hooks/useReloadAfterStationary';
import { login } from './services/auth';

const App: React.FC = () => {
  const { ipcRenderer }: any = window || {};
  const [api, contextHolder] = notification.useNotification(notificationSetting);
  const dispatch = useDispatch();
  const userData = getUserData();
  const timeRef = useRef<any>();
  const loopTimerRef = useRef<any>();
  const [form] = Form.useForm();
  const userAuthList = getUserAuthList();
  const [hostName, setHostName] = useState('');
  const [empowerVisible, setEmpowerVisible] = useState(false);
  const [hasInit, setHasInit] = useState(false);

  // 轮循查询每个方案启动状态
  const loopGetStatus = (list: any) => {
    if (list.length) {
      !!loopTimerRef.current && clearTimeout(loopTimerRef.current);
      getListStatusService().then((res: any) => {
        if (!!res && res.code === 'SUCCESS') {
          const result = list
            ?.sort((a: any, b: any) => {
              return b.updatedAt - a.updatedAt;
            })
            ?.map?.((item: any) => {
              return {
                ...item,
                running:
                  _.isObject(res?.data) && !_.isEmpty(res?.data[item.id]),
              };
            });
          dispatch(setProjectList(result));
          loopTimerRef.current = setTimeout(() => {
            loopGetStatus(list);
          }, 2500);
        } else {
          message.error(res?.message || '接口异常');
          dispatch(setProjectList(list));
        };
        dispatch(setLoading(false));
      });
    }
  };
  // 初始化列表
  const getList = () => {
    !!loopTimerRef.current && clearTimeout(loopTimerRef.current);
    dispatch(setLoading(true));
    // ProjectApi.list().then((res) => {
    getDataList().then((res: any) => {
      if (!!res && res.code === 'SUCCESS') {
        loopGetStatus(res?.data || []);
      } else {
        message.destroy(1);
        message.error(res?.message || '接口异常');
        dispatch(setLoading(false));
      }
    });
  };
  useLayoutEffect(() => {
    if (!localStorage.getItem('theme-mode')) {
      localStorage.setItem('theme-mode', 'dark');
    }
    if (
      location.href?.indexOf('#/flow') > -1 ||
      location.href?.indexOf('#/ccd') > -1 ||
      location.href?.indexOf('#/softwareopen') > -1 ||
      location.href?.indexOf('#/markdown') > -1 ||
      location.href?.indexOf('#/case') > -1
    ) {

    } else {
      getList();
      dispatch(getProjectList(getList));
      dispatch(loopProjectStatus(loopGetStatus));
    }

    return () => {
      !!loopTimerRef.current && clearTimeout(loopTimerRef.current);
      dispatch(setProjectList([]));
    };
  }, []);
  // 鉴权
  useEffect(() => {
    const getUseTimeFun = (hostName: string) => {
      ProjectApi.getStorage('softwareUseTime').then((res) => {
        const { num } = res?.data || {};
        const useNum = num || 0;
        ProjectApi.getStorage('softwareEmpowerTime').then((empowerRes) => {
          const { time = new Date().getTime() } = empowerRes?.data || {};
          if (
            permissionRule(
              {
                num: empowerRes?.data?.num,
                time: empowerRes?.data?.time,
                hostName: empowerRes?.data?.hostName
              },
              { useNum, time: res?.data?.time, today: new Date().getTime(), hostName })
          ) {
            setHasInit(false);
            setEmpowerVisible(true);
            clearInterval(timeRef.current);
          } else {
            if ((time - new Date().getTime()) < 3 * 24 * 3600 * 1000) {
              api.destroy();
              const { d, h, m, s } = timeToString(time - new Date().getTime());
              api.warning({
                message: '您的授权码即将到期',
                description: `您的授权仅剩余${d}天${h}小时${m}分钟，请尽快联系管理员续费！`,
                duration: null,
              });
            };
            setHasInit(true);
          };
        });
      });
    };
    // 获取机器hostname
    ipcRenderer?.once?.('hostname-read-reply', function (res: any) {
      if (res === 'error') {
        message.error('系统信息获取失败');
      } else {
        setHostName(res);
        getUseTimeFun(res);
        !!timeRef.current && clearInterval(timeRef.current);
        timeRef.current = setInterval(() => getUseTimeFun(res), 60 * 60 * 1000);
        // form.setFieldsValue({ _HOSTNAME: res });
      }
    });
    ipcRenderer?.ipcCommTest?.('hostname-read');

    return () => {
      !!timeRef.current && clearInterval(timeRef.current);
    };
  }, []);
  // 授权
  const onEmpower = (value: any) => {
    // HOSTNAME=zhangyiengdeAir.lan&DAY=QSC31UBV880&TODAY=1715915771453   SE9TVE5BTUU9emhhbmd5aWVuZ2RlQWlyLmxhbiZEQVk9cXNjMzF1YnY4ODAmVE9EQVk9MTcxNTkxNTc3MTQ1Mw==
    /**
     * DAY: 授权天数（比如30天，写成QSC31UBV880，QSC和1UBV88是盐）
     * TODAY: 授权那天那个时刻（毫秒时间戳）
     * HOSTNAME: 机器编码
     **/
    try {
      if (
        value?.indexOf('HOSTNAME') > -1 ||
        value?.indexOf('TODAY') > -1 ||
        value?.indexOf('DAY') > -1
      ) {
        message.error('授权码不合法，请联系管理员');
        throw new Error();
      }
      const jiemi = cryptoDecrypt(value);
      const empowerParam: any = GetQueryObj(jiemi) || {};
      if (
        !empowerParam?.DAY ||
        !empowerParam?.TODAY ||
        !empowerParam?.HOSTNAME ||
        empowerParam?.HOSTNAME !== hostName
      ) {
        message.error('授权码不合法，请联系管理员');
        throw new Error();
      }
      const day =
        Number(
          empowerParam?.DAY.split('QSC')?.[1]?.split('1UBV88')?.join('') || '0'
        ) || 0;
      if (empowerParam.TODAY + day * 24 * 3600 * 1000 <= new Date().getTime()) {
        message.error('授权码已过期');
        throw new Error();
      }
      const time = new Date().getTime() + day * 24 * 3600 * 1000;
      const params = {
        empowerId: value,
        time,
        num: day * 24,
        today: Number(empowerParam.TODAY),
        hostName
      };
      ProjectApi.addStorage('softwareEmpowerTime', params).then(() => {
        ProjectApi.addStorage('softwareUseTime', {
          time: new Date().getTime(),
          num: 0,
        }).then(() => {
          setEmpowerVisible(false);
          window.location.reload();
        });
      });
    } catch (err: any) {
      console.log(err);
    }
  };
  // 登录
  const onLogin = (values: any) => {
    const userData = getUserData();
    const { password, ...rest } = values;
    login({
      password: cryptoEncryption(password),
      ...rest,
    }).then((res: any) => {
      if (res && res.code === 'SUCCESS') {
        localStorage.setItem(
          'userInfo',
          JSON.stringify(
            Object.assign({}, res?.data, { loginTime: new Date().getTime() })
          )
        );
        if (res?.data?.id !== userData?.id) {
          location.href = location.href?.split('#/')?.[0] + '#/alert';
          window.location.reload();
        }
      } else {
        message.error(res?.msg || res?.message || '接口异常');
      }
      setLoading(false);
    });
  };
  if (!userData?.userName && location?.href?.indexOf?.('#/flow') < 0) {
    onLogin({ userName: 'sany', password: '123' });
  } else if (
    userData.userName !== 'sany' &&
    location.href?.indexOf('#/flow') < 0
  ) {
    useReloadAfterStationary(
      { wait: 1000 * 60 * 60 * 2, interval: 1000 * 60 },
      () => {
        const time = getLoginTime();
        const current = new Date().getTime();
        if (
          location.href?.indexOf('#/login') < 0 &&
          current - time >= 2 * 60 * 60 * 1000
        ) {
          onLogin({ userName: 'sany', password: '123' });
        }
      }
    );
  };

  return (
    <Fragment>
      {contextHolder}
      <ConfigProvider
        locale={zhCN}
        theme={Object.assign(
          {
            cssVar: true, hashed: false,
            token: {
              // Seed Token，影响范围大
              // colorPrimary: '#16f4ff',
              borderRadius: 2,
              // 派生变量，影响范围小
              // colorBgContainer: '#f6ffed',
            }
          },
          localStorage.getItem('theme-mode') === 'light' ? {

          } : {
            // 1. 单独使用暗色算法
            algorithm: theme.darkAlgorithm,

            // 2. 组合使用暗色算法与紧凑算法
            // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
          }
        )}
      >
        {
          useMemo(() => {
            if (!hasInit) {
              return null;
            }
            return <HashRouter>
              <BasicLayout>
                {
                  location.href?.indexOf('#/flow') > -1 ? (
                    <Routes>
                      <Route path="/flow" element={<FlowPage />} />
                    </Routes>
                  ) :
                    location.href?.indexOf('#/ccd') > -1 ? (
                      <Routes>
                        <Route path="/ccd/*" element={<CCDPage />} />
                      </Routes>
                    ) :
                      location.href?.indexOf('#/softwareopen') > -1 ? (
                        <Routes>
                          <Route path="/softwareopen" element={<SoftwareOpenPage />} />
                        </Routes>
                      ) :
                        location.href?.indexOf('#/markdown') > -1 ? (
                          <Routes>
                            <Route path="/markdown" element={<MarkdownPage />} />
                          </Routes>
                        ) :
                          location.href?.indexOf('#/case') > -1 ? (
                            <Routes>
                              <Route path="/case" element={<CasePage />} />
                            </Routes>
                          ) :

                            (
                              <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/home" element={<HomePage />} />
                                <Route path="/project" element={<ProjectPage />} />
                                <Route path="/alert/*" element={<AlertPage />} />
                                <Route path="/plugin" element={<PluginPage />} />
                                <Route path="/plugin/modify/:id" element={<PluginEditPage />} />
                                <Route path="/software" element={<SoftwarePage />} />
                                <Route path="/auth/*" element={<AuthPage />} />
                                <Route path="/userSetting" element={<UserPage />} />
                                <Route path="/setting/*" element={<SettingPage setEmpowerVisible={setEmpowerVisible} />} />
                                {userAuthList?.includes('projects.list') ? (
                                  <Route path="*" element={<HomePage />} />
                                ) : (
                                  <Route path="*" element={<AlertPage />} />
                                )}
                              </Routes>
                            )
                }
              </BasicLayout>
            </HashRouter>
          }, [hasInit])
        }
      </ConfigProvider>

      {!!empowerVisible ? (
        <Modal
          title="授权"
          maskClosable={false}
          closable={false}
          open={empowerVisible}
          footer={
            <div className="flex-box-justify-end">
              <Button
                type="primary"
                onClick={() => {
                  form
                    .validateFields()
                    .then((values) => {
                      const { value } = values;
                      console.log(values, hostName);

                      onEmpower(value);
                    })
                    .catch((err = {}) => {
                      const { errorFields } = err;
                      if (_.isArray(errorFields)) {
                        message.error(`${errorFields[0]?.errors[0]} 是必填项`);
                      }
                    });
                }}
              >
                确认授权
              </Button>
            </div>
          }
          centered
        >
          <Form form={form} layout={'vertical'} scrollToFirstError>
            <div className="flex-box-align-end">
              <Form.Item
                name="_HOSTNAME"
                label="机器编码:"
                style={{ width: 'calc(100% - 64px)' }}
                initialValue={hostName}
                rules={[{ required: true, message: '机器编码' }]}
              >
                <Input disabled />
              </Form.Item>
              <a
                onClick={() => {
                  copyUrlToClipBoard(hostName);
                }}
                style={{
                  whiteSpace: 'nowrap',
                  lineHeight: '32px',
                  width: 64,
                  textAlign: 'right',
                  marginBottom: 24,
                }}
              >
                复制
              </a>
            </div>
            <Form.Item
              name="value"
              label="授权码:"
              rules={[{ required: true, message: '授权码' }]}
            >
              <Input placeholder="授权码" autoFocus />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}
    </Fragment>
  )
}

export default authWrapper(App);