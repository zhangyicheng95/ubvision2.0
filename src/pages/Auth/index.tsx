import React, { useEffect, useReducer } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import AuthorLayout from '@/pages/Auth/components/layouts';
import { StoreEnum } from '@/pages/Auth/store/typing';
import { init, reducer, State } from '@/pages/Auth/store';
import UserPage from '@/pages/Auth/components/User';
import UserEditPage from '@/pages/Auth/components/User/Edit';
import GroupPage from '@/pages/Auth/components/Group';
import GroupEditPage from '@/pages/Auth/components/Group/Edit';
import { getUserAuthList } from '@/utils/utils';

const AuthRouter = () => {
  const [stateData, dispatch] = useReducer(reducer, State, init);
  const userAuthList = getUserAuthList();

  useEffect(() => {
    if (userAuthList.includes('auth.users')) {
      location.href = location.href?.split('#/')?.[0] + '#/auth/user';
    } else if (userAuthList.includes('auth.groups')) {
      location.href = location.href?.split('#/')?.[0] + '#/auth/group';
    }
    
    return () => {
      // 销毁组件时，清空数据
      dispatch({
        type: StoreEnum.resetData
      });
    };
  }, []);
  // 获取用户列表
  const getUserList = () => {

  };
  // 获取权限分组列表
  const getGroupList = () => {

  };
  return (
    <AuthorLayout
      stateData={stateData}
      dispatch={dispatch}
      getUserList={getUserList}
      getGroupList={getGroupList}
    >
      <Routes>
        {/* <Route path="/" element={<UserPage stateData={stateData} dispatch={dispatch} />} />
        <Route path="/user" element={<UserPage stateData={stateData} dispatch={dispatch} />} />
        <Route path="/user/modify" element={<UserEditPage stateData={stateData} dispatch={dispatch} />} />
        <Route path="/group" element={<GroupPage stateData={stateData} dispatch={dispatch} />} />
        <Route path="/group/modify" element={<GroupEditPage stateData={stateData} dispatch={dispatch} />} /> */}
      </Routes>
    </AuthorLayout>
  );
};
export default AuthRouter;
