import React from 'react';

import useAuth from '@/hooks/useAuth';
import _ from 'lodash';

const authWrapper = (WrappedComponent: any) => {

  const Component = (props: any) => {

    const { getAuth, status } = useAuth();

    // 默认进来读取本地设置的主题
    const params: any = !!location.search
      ? new URLSearchParams(location.search)
      : !!location.href
        ? new URLSearchParams(location.href)
        : {};
    const number = params.get('number') || 1;
    const theme = localStorage.getItem('theme-mode');
    if (!_.isNull(number)) {
      window?.ipcRenderer?.invoke?.(`theme-mode-${number}`, theme || 'dark');
    }
    if (status === 'loading') {
      return <div>loading...</div>;
    }
    if (status === 'error') {
      return <div>权限获取失败，请检查网络</div>;
    }

    return <WrappedComponent getAuth={getAuth} {...props} />;
  };

  return Component;

};

export default authWrapper;
