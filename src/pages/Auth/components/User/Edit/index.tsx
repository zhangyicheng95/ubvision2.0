import React, { Fragment, useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './index.module.less';
import { addUser, getGroupList, getUserById, updateUserById } from '@/services/auth';
import { userType } from '@/common/constants/globalConstants';
import { StoreEnum } from '@/pages/Auth/store/typing';
import { cryptoEncryption, getUserData } from '@/utils/utils';
import * as _ from 'lodash';

interface Props {
  stateData: any;
  dispatch: any;
}

const UserEditPage: React.FC<Props> = (props: any) => {
  const { stateData, dispatch } = props;
  const location: any = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { validateFields, resetFields, getFieldsValue, setFieldsValue } = form;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [groupList, setGroupList] = useState<any>([]);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    getGroupList().then((res: any) => {
      if (!!res && res?.code === 'SUCCESS') {
        setGroupList(res?.data || []);
      } else {
        message.error(res?.message || '接口异常');
      }
    });
    if (!!state) {
      setLoading(true);
      getUserById(state).then((res: any) => {
        if (!!res && res?.code === 'SUCCESS') {
          const result = _.omit(res?.data, 'password') || {};
          setData(result);
          setFieldsValue(result);
        } else {
          message.error(res?.message || '接口异常');
        }
        setLoading(false);
      });
    }
  }, [state]);
  const onCancel = () => {
    navigate(-1);
  };
  const handleOk = () => {
    validateFields()
      .then((values) => {
        const { userName, password, ...rest } = values;
        setLoading(true);
        const userInfo = getUserData();
        const params = Object.assign({}, data, rest, {
          userName: userName?.trim?.(),
          designedBy: userInfo?.userName,
          loginAuth: userInfo?.auth,
        },
          password ? {
            password: cryptoEncryption(password?.trim?.()),
          } : {});
        console.log(params)
        if (data?.id) {
          updateUserById(data?.id, params).then((res: any) => {
            if (!!res && res?.code === 'SUCCESS') {
              message.success('编辑成功');
              onCancel();
            } else {
              message.error(res?.message || '接口异常');
            }
            setLoading(false);
          });
        } else {
          addUser(params).then((res: any) => {
            if (!!res && res?.code === 'SUCCESS') {
              message.success('添加成功');
              onCancel();
            } else {
              message.error(res?.message || '接口异常');
            }
            setLoading(false);
          });
        }
      })
      .catch((err) => {
        const { errorFields } = err;
        message.error(`${errorFields[0].errors[0]} 是必填项`);
      });
  };
  useEffect(() => {
    dispatch({
      type: StoreEnum.buttonDom,
      value: <Fragment>
        <Button
          loading={loading}
          onClick={() => {
            return onCancel();
          }}
        >
          返回
        </Button>
        <Button
          type="primary"
          loading={loading}
          style={{ marginLeft: 8 }}
          onClick={() => {
            return handleOk();
          }}
        >
          保存
        </Button>
      </Fragment>,
    });
    return () => {
      dispatch({
        type: StoreEnum.buttonDom,
        value: '',
      });
    }
  }, [data, loading]);
  return <div className={`${styles.userEditPage}`}>
    <Spin spinning={loading} tip={"加载中..."}>
      <Form
        form={form}
        // labelCol={{ span: 6 }}
        // wrapperCol={{ span: 16 }}
        // layout={'vertical'}
        scrollToFirstError
      >
        <Form.Item
          name="userName"
          label="用户账号"
          rules={[{ required: true, message: '用户账号' }]}
        >
          <Input placeholder='用户账号' allowClear disabled={!!data?.userName} />
        </Form.Item>
        {
          (!state || passwordVisible) ?
            <Form.Item
              name="password"
              label="用户密码"
              rules={[{ required: !state, message: '用户密码' }]}
            >
              <Input.Password placeholder='用户密码' allowClear />
            </Form.Item>
            : null
        }
        <Form.Item
          name="nickName"
          label="用户昵称"
          rules={[{ required: false, message: '用户昵称' }]}
        >
          <Input placeholder='用户昵称' allowClear />
        </Form.Item>
        <Form.Item
          name="auth"
          label="角色分组"
          rules={[{ required: true, message: '角色分组' }]}
        >
          <Select
            style={{ width: '100%' }}
            options={(groupList || [])?.map?.((item: any) => {
              const { auth } = item;
              if (auth === 'superAdmin') {
                return null;
              }
              return {
                label: !!userType[auth] ? userType[auth] : auth,
                value: auth,
                key: auth,
              }
            }).filter(Boolean)}
          />
        </Form.Item>
      </Form>
      {
        !!state ?
          <Button onClick={() => setPasswordVisible((prev: any) => !prev)}>
            {passwordVisible ? '取消' : '修改密码'}
          </Button>
          : null
      }
    </Spin>
  </div>;
};


export default UserEditPage;

