import { useState } from 'react';
import UpdateElectron from '@/components/update';
import logoVite from '@/assets/logo-vite.svg';
import logoElectron from '@/assets/logo-electron.svg';
import './App.css';
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
// import UserPage from '@/pages/User';
// import Setting from '@/pages/Setting';

function App() {
  const [count, setCount] = useState(0)
  const userAuthList = getUserAuthList();

  return (
    <ErrorBoundary>
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
              <Route path="/resource/*" element={<ResourceRouter />} />
              <Route path="/alert/*" element={<AlertRouter />} />
              <Route path="/userSetting" element={<UserPage />} />
              <Route path="/setting/*" element={<Setting />} />
              <Route path="/software" element={<SoftwareRouter />} />
              <Route path="/auth/*" element={<AuthRouter />} /> */}
              {userAuthList?.includes('projects') ? (
                <Route path="*" element={<HomePage />} />
              ) : (
                <Route path="*" element={<AlertRouter />} />
              )}
            </Routes>
          )}
        </BasicLayout>
      </HashRouter>
    </ErrorBoundary>
  )
}

export default authWrapper(App)