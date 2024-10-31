import React from 'react';
import { useNavigate } from 'react-router';

interface Props {
  activeTab: string;
  stateData: any;
  dispatch: any;
}

const SiderNav: React.FC<Props> = (props: any) => {
  const { activeTab, stateData, dispatch } = props;
  const navigate = useNavigate();

  return (
    <div className="setting-left-tree">
      {tabList?.map?.((tab) => {
        return (
          <div
            className={`tree-item ${
              activeTab === tab.key ? 'menu-selected-self' : ''
            }`}
            key={tab.key}
            onClick={() => {
              if (tab.key === 'logout') {
                localStorage.removeItem('userInfo');
                navigate('/login');
              } else {
                navigate(`/setting/${tab.key}`);
              }
            }}
          >
            {tab.title}
          </div>
        );
      })}
    </div>
  );
};

export default SiderNav;

const tabList = [
  {
    title: '通用设置',
    key: 'general',
  },
  {
    title: '关于',
    key: 'about',
  },
  // {
  //   title: '个人中心',
  //   key: 'user',
  // },
  {
    title: '退出登录',
    key: 'logout',
  },
];
