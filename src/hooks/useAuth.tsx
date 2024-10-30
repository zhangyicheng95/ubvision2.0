import { useEffect, useState } from 'react';

import { getAuthApi } from '@/services/auth';
// import store from '@/stores/globalStore';

const useAuth = () => {

  const [authMap, setAuthMap] = useState({});
  const [status, setStatus] = useState('loading'); // loading 获取权限中, error 获取权限失败

  useEffect(() => {
    getAuthApi().then((res: any) => {
      if (res && res.code === 200) {
        // localStorage.setItem('userdata', JSON.stringify(res.data));
        const authMap = {};
        (res.authResults || []).forEach((item: any) => {
          // @ts-ignore
          authMap[item.code] = item.selected;
        });
        setAuthMap(authMap);
        // 挂载权限数据到store
        // store.updateAuth(authMap);
        // 改变状态
        setStatus('');
      } else {
        setStatus('error');
      }
    }).catch(error => {
      if (error && error.response) {
        if (error.response.status !== 401) {
          setStatus('error');
        }
      }
    });
  }, []);


  return {
    auth: authMap,
    status,
    getAuth: (code: any) => {
      if (code) {
        // @ts-ignore
        return authMap[code];
      }
      return true;
    }
  };
};

export default useAuth;
