import { Fragment, useEffect, useRef, useState } from 'react';
import './App.css';
import { Button, ConfigProvider, Form, Input, message, Modal, notification, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
// for date-picker i18n
import 'dayjs/locale/zh-cn';
import BasicLayout from '@/layouts/BasicLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { copyUrlToClipBoard, cryptoDecrypt, GetQueryObj, getUserAuthList, timeToString } from './utils/utils';
import * as _ from 'lodash-es';
import ProjectApi from '@/api/project';
import authWrapper from '@/components/authWrapper';
import Login from '@/pages/Login';
import HomePage from '@/pages/Home';
import AlertRouter from '@/pages/Alert';
// import ProjectPage from '@/pages/Project';
// import FlowEditor from '@/pages/FlowEditor';
import UserPage from '@/pages/UserInfo';
import Setting from '@/pages/Setting';
import SoftwareRouter from './pages/Software';
import AuthRouter from './pages/Auth';
import { permissionRule } from './common/globalConstants';

const App: React.FC = () => {
  const { ipcRenderer }: any = window || {};
  const timeRef = useRef<any>();
  const [form] = Form.useForm();
  const userAuthList = getUserAuthList();
  const [hostName, setHostName] = useState('SE9TVE5BTUU9emhhbmd5aWVuZ2RlQWlyLmxhbiZEQVk9UVNDOTkxVUJWODg5OTkmVE9EQVk9MTcxNTkxNTc3MTQ1Mw');
  const [empowerVisible, setEmpowerVisible] = useState(false);

  useEffect(() => {
    const getUseTimeFun = (hostName: string) => {
      ProjectApi.getStorage('softwareUseTime').then((res) => {
        const { num } = res?.data || {};
        const useNum = (num || 0) + 1;
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
            setEmpowerVisible(true);
            clearInterval(timeRef.current);
          } else if (time - new Date().getTime() < 3 * 24 * 3600 * 1000) {
            notification.destroy();
            const { d, h, m, s } = timeToString(time - new Date().getTime());
            notification.warning({
              message: '您的授权码即将到期',
              description: `您的授权仅剩余${d}天${h}小时${m}分钟，请尽快联系管理员续费！`,
              duration: null,
            });
          }
        });
      });
    };
    // 获取机器hostname
    ipcRenderer.once('hostname-read-reply', function (res: any) {
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
    ipcRenderer.ipcCommTest('hostname-read');

    return () => {

    };
  }, []);
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

  return (
    <ErrorBoundary>
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
          localStorage.getItem('theme-mode') === 'dark' ? {
            algorithm: theme.darkAlgorithm,
          } : {

          }
        )}
      >
        <HashRouter>
          <BasicLayout>
            {location.href?.indexOf('#/flow') > -1 ? (
              <Routes>
                {/* <Route path="/flow" element={<FlowEditor />} /> */}
              </Routes>
            ) : (
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<HomePage />} />
                {/* <Route path="/project" element={<ProjectPage />} />
              <Route path="/flow" element={<FlowEditor />} />
              <Route path="/resource/*" element={<ResourceRouter />} /> */}
                <Route path="/alert/*" element={<AlertRouter />} />
                <Route path="/userSetting" element={<UserPage />} />
                <Route path="/setting/*" element={<Setting setEmpowerVisible={setEmpowerVisible} />} />
                <Route path="/software" element={<SoftwareRouter />} />
                <Route path="/auth/*" element={<AuthRouter />} />
                {userAuthList?.includes('projects') ? (
                  <Route path="*" element={<HomePage />} />
                ) : (
                  <Route path="*" element={<AlertRouter />} />
                )}
              </Routes>
            )}
          </BasicLayout>
        </HashRouter>
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
    </ErrorBoundary>
  )
}

export default authWrapper(App);