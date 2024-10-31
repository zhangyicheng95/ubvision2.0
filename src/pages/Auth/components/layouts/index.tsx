import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Upload, Button, message, Modal } from 'antd';
import { CloudDownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import SiderNav from './siderNav';
import PrimaryTitle from '@/components/PrimaryTitle';
import styles from './index.module.less';
import * as _ from 'lodash-es';
import { addPlugin, deletePlugin } from '@/services/flowPlugin';
import { getUserAuthList } from '@/utils/utils';

interface Props {
  stateData: any;
  dispatch: any;
  getUserList: any;
  getGroupList: any;
  children: any;
}
const { confirm } = Modal;

const AuthorLayout: React.FC<Props> = (props: any) => {
  const { children, stateData, dispatch, getUserList, getGroupList } = props;
  const { ipcRenderer }: any = window?.Electron || {};
  const userAuthList = getUserAuthList();
  const targetPath = JSON.parse(localStorage.getItem('general_setting') || '{}')?.folder_path;
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname = '/auth/user' } = location;
  const [activeTab, setActiveTab] = useState('user');

  useEffect(() => {
    const pathList = pathname.split('/');
    const active = pathList.length > 2 ? pathList[2] : 'user';
    setActiveTab(active);
  }, [pathname]);

  return (
    <div className={styles.authPage}>
      <PrimaryTitle
        title={pathname.indexOf('user') > -1 ? '用户管理  Users' : '分组管理  Groups'}
      // onSearch={['/auth', '/auth/user'].includes(pathname) ? onSearch : null}
      >
        {
          !!stateData.buttonDom ?
            stateData.buttonDom
            :
            (userAuthList.includes('auth.users.add') && ['/auth', '/auth/user'].includes(pathname)) ?
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => navigate('user/modify')}
              >
                新增用户
              </Button>
              :
              (userAuthList.includes('auth.groups.add') && ['/auth/group'].includes(pathname)) ?
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => navigate('group/modify')}
                >
                  新建分组
                </Button>
                :
                null
        }
      </PrimaryTitle>
      <div className="auth-body flex-box">
        <SiderNav
          activeTab={activeTab}
          stateData={stateData}
          dispatch={dispatch}
        />
        <div className="auth-content">{children}</div>
      </div>
    </div>
  );
};

export default AuthorLayout;
