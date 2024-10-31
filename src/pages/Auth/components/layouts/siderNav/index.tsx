import React, { } from 'react';
import { useNavigate } from 'react-router';

import { StoreEnum } from '@/pages/Auth/store/typing';
import { getUserAuthList } from '@/utils/utils';



interface Props {
  activeTab: string;
  stateData: any,
  dispatch: any,
}

const SiderNav: React.FC<Props> = (props: any) => {
  const { activeTab, dispatch } = props;
  const navigate = useNavigate();
  const userAuthList = getUserAuthList();
  return (
    <div className="auth-left-tree flex-box">
      {
        tabList?.map?.(tab => {
          if (!userAuthList.filter((i: any) => i?.indexOf(`auth.${tab.key}s`) > -1)?.length) {
            return null;
          }
          return <div
            className={`tree-item ${activeTab?.indexOf(tab.key) > -1 ? 'menu-selected-self auth-menu-selected-self' : ''}`}
            key={tab.key}
            onClick={() => {
              navigate(`/auth/${tab.key}`);
              dispatch({
                type: StoreEnum.searchValue,
                value: ''
              });
            }}
          >
            {tab.title}
          </div>;
        })
      }
    </div>
  );
};

export default SiderNav;

const tabList = [
  {
    title: '用户管理',
    key: 'user'
  },
  {
    title: '分组管理',
    key: 'group'
  }
];
