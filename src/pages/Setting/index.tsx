import { useEffect, useReducer } from 'react';
import { Routes, Route } from 'react-router-dom';

import { StoreEnum } from '@/pages/Setting/store/typing';
import { init, reducer, State } from '@/pages/Setting/store';
import SettingLayout from '@/pages/Setting/components/layouts';
import GeneralPage from '@/pages/Setting/components/General';
import ShortcutPage from '@/pages/Setting/components/Shortcut';
import AboutPage from '@/pages/Setting/components/About';
import UserInfoPage from '@/pages/Setting/components/UserInfo';

const ResourceRouter = () => {
  const [stateData, dispatch] = useReducer(reducer, State, init);

  useEffect(() => {
    return () => {
      // 销毁组件时，清空数据
      dispatch({
        type: StoreEnum.resetData,
      });
    };
  }, []);
  return (
    <SettingLayout stateData={stateData} dispatch={dispatch}>
      <Routes>
        <Route
          path="/"
          element={<GeneralPage stateData={stateData} dispatch={dispatch} />}
        />
        <Route
          path="/general"
          element={<GeneralPage stateData={stateData} dispatch={dispatch} />}
        />
        <Route
          path="/shortcut"
          element={<ShortcutPage stateData={stateData} dispatch={dispatch} />}
        />
        <Route
          path="/about"
          element={<AboutPage stateData={stateData} dispatch={dispatch} />}
        />
        <Route
          path="/user"
          element={<UserInfoPage stateData={stateData} dispatch={dispatch} />}
        />
      </Routes>
    </SettingLayout>
  );
};
export default ResourceRouter;
