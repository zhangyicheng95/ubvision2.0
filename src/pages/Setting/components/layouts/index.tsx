import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import SiderNav from './siderNav';
import PrimaryTitle from '@/components/PrimaryTitle';
import styles from './index.module.less';

interface Props {
  children: any;
}

const SettingLayout: React.FC<Props> = (props: any) => {
  const {
    children,
  } = props;
  const location = useLocation();
  const { pathname = '/setting/general' } = location;
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const pathList = pathname.split('/');
    const active = pathList.length > 2 ? pathList[2] : 'general';
    setActiveTab(active);
  }, [pathname]);

  return <div className={styles.settingPage}>
    <PrimaryTitle title="设置  Setting" />
    <div className="setting-body flex-box">
      <SiderNav activeTab={activeTab} />
      <div className="setting-content">
        {children}
      </div>
    </div>
  </div>;
};

export default SettingLayout;
