import React, { Fragment, useEffect, useReducer, useState } from 'react';
import { Empty, message, Popconfirm, Spin, Table } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserAuth, getUserAuthList, guid } from '@/utils/utils';
import styles from './index.module.less';
import BasicTable from '@/components/BasicTable';
import { deleteGroupByIdService, getGroupListService } from '@/services/auth';
import moment from 'moment';
import { userType } from '@/common/globalConstants';



interface Props {
 
}

const GroupPage: React.FC<Props> = (props: any) => {
  const navigate = useNavigate();
  const userAuthList = getUserAuthList();
  const userAuth = getUserAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getList = () => {
    setLoading(true);
    getGroupListService().then((res: any) => {
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
      title: '分组',
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: any) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '103px',
      render: (text: any, record: any) => {
        const { auth } = record;
        if (
          !(userAuthList.includes('auth.groups.modify') && (auth !== 'superAdmin' || userAuth == 'superAdmin')) &&
          !(userAuthList.includes('auth.groups.delete') && auth !== 'superAdmin')
        ) {
          return '-';
        }
        return (
          <div>
            {
              (userAuthList.includes('auth.groups.modify') && (auth !== 'superAdmin' || userAuth == 'superAdmin')) ?
                <Fragment>
                  <span className='operation-style' onClick={() => {
                    navigate('modify', {
                      state: record.id
                    });
                  }}>编辑</span>
                  {
                    (userAuthList.includes('auth.groups.delete') && auth !== 'superAdmin') ?
                      <span className="operation-line">|</span>
                      : null
                  }
                </Fragment>
                : null
            }
            {
              (userAuthList.includes('auth.groups.delete') && auth !== 'superAdmin') ?
                <Popconfirm
                  title="确定删除?"
                  onConfirm={() => {
                    setLoading(true);
                    deleteGroupByIdService(record.id).then((res: any) => {
                      if (!!res && res?.code === 'SUCCESS') {
                        getList();
                      } else {
                        message.error(res?.message || '接口异常');
                        setLoading(false);
                      }
                    });
                  }}
                >
                  <span className='operation-style'>删除</span>
                </Popconfirm>
                : null
            }
          </div>
        )
      },
    },
  ];
  return <div className={`${styles.groupPage} flex-box-column`}>
    <div className="group-content">
      {
        userAuthList.includes('auth.groups') ?
          <BasicTable
            className="model-list-table"
            // rowSelection={{
            //   ...rowSelection,
            // }}
            columns={columns}
            pagination={null}
            loading={loading}
            dataSource={data}
            locale={userAuthList.includes('auth.groups.add') ? {
              emptyText: <Empty
                description={
                  <span style={{ fontSize: 16 }}>
                    去 <a onClick={() => navigate('modify')}>新增分组</a>
                  </span>
                }
              />
            } : {}}
            rowKey={(record: any) => record.id || guid()}
          />
          : null
      }
    </div>
  </div>;
};


export default GroupPage;

