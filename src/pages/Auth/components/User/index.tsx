import React, { Fragment, useEffect, useReducer, useState } from 'react';
import { Empty, message, Popconfirm, Spin, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserAuth, getUserAuthList, getUserData, guid } from '@/utils/utils';
import styles from './index.module.less';
import BasicTable from '@/components/BasicTable';
import { deleteUserById, getUserList } from '@/services/auth';
import { userType } from '@/common/constants/globalConstants';
import { filter } from 'jszip';

interface Props {
  stateData: any;
  dispatch: any;
}

const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

const UserPage: React.FC<Props> = (props: any) => {
  const { stateData, dispatch } = props;
  const navigate = useNavigate();
  const userAuthList = getUserAuthList();
  const userAuth = getUserAuth();
  const userData = getUserData();
  const location = useLocation();
  const { pathname = '/' } = location;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getList = () => {
    setLoading(true);
    getUserList().then((res: any) => {
      if (!!res && res?.code === 'SUCCESS') {
        setData(res?.data || []);
      } else {
        message.error(res?.message || '接口异常');
      }
      setLoading(false);
    });
  };
  useEffect(() => {
    getList();
  }, []);
  const columns = [
    {
      title: '角色账户',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      render: (text: string, record: any) => {
        const { userName } = record;
        return text || userName || '-';
      }
    },
    {
      title: '角色分组',
      dataIndex: 'auth',
      key: 'auth',
      render: (text: string) => {
        return !!userType[text] ? userType[text] : text;
      }
    },
    {
      title: '来自于',
      dataIndex: 'designedBy',
      key: 'designedBy',
      render: (text: string) => {
        // @ts-ignore
        return data?.filter((i: any) => i?.userName === text)?.[0]?.nickName || text || '-';
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '103px',
      render: (text: any, record: any) => {
        const { auth, id } = record;
        if (
          !(userAuthList.includes('auth.users.modify') && (auth !== 'superAdmin' || userAuth == 'superAdmin')) &&
          !(userAuthList.includes('auth.users.delete') && auth !== 'superAdmin' && id !== userData?.id)
        ) {
          return '-';
        }
        return (
          <div>
            {
              (userAuthList.includes('auth.users.modify') && (auth !== 'superAdmin' || userAuth == 'superAdmin')) ?
                <Fragment>
                  <span className='nameStyle' onClick={() => {
                    navigate(pathname?.indexOf('/user') > -1 ? 'modify' : 'user/modify', {
                      state: record.id
                    });
                  }}>编辑</span>
                  {
                    (userAuthList.includes('auth.users.delete') && auth !== 'superAdmin' && id !== userData?.id) ?
                      <span className="operation-line">|</span>
                      : null
                  }
                </Fragment>
                : null
            }
            {
              (userAuthList.includes('auth.users.delete') && auth !== 'superAdmin' && id !== userData?.id) ?
                <Popconfirm
                  title="确定删除?"
                  onConfirm={() => {
                    setLoading(true);
                    deleteUserById(record.id).then((res: any) => {
                      if (!!res && res?.code === 'SUCCESS') {
                        getList();
                      } else {
                        message.error(res?.message || '接口异常');
                        setLoading(false);
                      }
                    });
                  }}
                >
                  <span className='nameStyle'>删除</span>
                </Popconfirm>
                : null
            }
          </div>
        )
      },
    },
  ];

  return <div className={`${styles.userPage} flex-box-column`}>
    <div className="user-content">
      {
        userAuthList.includes('auth.users') ?
          <BasicTable
            className="model-list-table"
            // rowSelection={{
            //   ...rowSelection,
            // }}
            columns={columns}
            pagination={null}
            loading={loading}
            dataSource={data}
            locale={userAuthList.includes('auth.users.add') ? {
              emptyText: <Empty
                // image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                // imageStyle={{
                //   height: 60,
                // }}
                description={
                  <span style={{ fontSize: 16 }}>
                    去 <a onClick={() => navigate('modify')}>新增用户</a>
                  </span>
                }
              />
            } : {}}
            rowKey={(record: any) => record.id}
          />
          : null
      }
    </div>
  </div>;
};


export default UserPage;

