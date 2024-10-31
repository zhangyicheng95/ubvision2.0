import { useState } from 'react';
import './App.css';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
// for date-picker i18n
import 'dayjs/locale/zh-cn';
import BasicLayout from '@/layouts/BasicLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { getUserAuthList } from './utils/utils';
import authWrapper from '@/components/authWrapper';
import Login from '@/pages/Login';
import HomePage from '@/pages/Home';
import AlertRouter from '@/pages/Alert';
// import ProjectPage from '@/pages/Project';
// import Collect from '@/pages/Collect';
// import FlowEditor from '@/pages/FlowEditor';
import UserPage from '@/pages/UserInfo';
import Setting from '@/pages/Setting';
import SoftwareRouter from './pages/Software';
import AuthRouter from './pages/Auth';

const App: React.FC = () => {
  const userAuthList = getUserAuthList();

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={Object.assign(
          {
            cssVar: true, hashed: false,
            token: {
              // Seed Token，影响范围大
              colorPrimary: '#16f4ff',
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
              <Route path="/collect/*" element={<Collect />} />
              <Route path="/resource/*" element={<ResourceRouter />} /> */}
                <Route path="/alert/*" element={<AlertRouter />} />
                <Route path="/userSetting" element={<UserPage />} />
                <Route path="/setting/*" element={<Setting />} />
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
    </ErrorBoundary>
  )
}

export default authWrapper(App);