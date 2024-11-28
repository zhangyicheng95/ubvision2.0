import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { login } from '@/services/auth';
import { cryptoEncryption } from '@/utils/utils';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

interface Props { }

const Login: React.FC<Props> = (props: any) => {
  const [form] = Form.useForm();
  const { setFieldsValue } = form;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const clickNum = useRef(0);

  useEffect(() => {
    if (!localStorage.getItem('userList')) {
      localStorage.setItem('userList', JSON.stringify(['admin', 'sany']));
    }

    return () => {
      clickNum.current = 0;
    };
  }, []);

  const onFinish = (values: any) => {
    const { userName, password } = values;
    setLoading(true);
    login({
      ...values,
      password: cryptoEncryption(password),
    })
      .then((res: any) => {
        if (!!res && res.code === 'SUCCESS') {
          localStorage.setItem(
            'userList',
            JSON.stringify(
              _.uniq(
                JSON.parse(localStorage.getItem('userList') || '[]').concat(
                  userName
                )
              )
            )
          );

          localStorage.setItem(
            'userInfo',
            JSON.stringify(
              Object.assign({}, res?.data, {
                loginTime: new Date().getTime(),
              })
            )
          );

          if (res?.data?.authList?.includes('projects')) {
            navigate('/home');
          } else {
            navigate('/alert');
          }
          window.location.reload();
        } else {
          message.error(res?.message || '接口异常');
        }
        setLoading(false);
      })
      .catch((err: any) => {
        const { errorFields } = err;
        message.error(`${errorFields[0].errors[0]} 是必填项`);
      });
  };
  console.log('login');

  return (
    <div className={`${styles.loginPage}  flex-box-column`}>
      <div
        className="login-title"
        onClick={() => {
          if (clickNum.current >= 5) {
            onFinish({ userName: 'admin', password: 'Sany@123' });
          } else {
            clickNum.current += 1;
          }
        }}
      >
        UBVision
      </div>
      <Form
        name="basic"
        form={form}
        // labelCol={{ span: 6 }}
        // wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          label=""
          name="userName"
          rules={[{ required: true, message: '请输入用户名!' }]}
        >
          <AutoComplete
            style={{ width: '100%' }}
            options={_.uniq(
              JSON.parse(localStorage.getItem('userList') || '[]')?.concat([
                'admin',
                'sany',
              ])
            )?.map?.((item: any) => ({ label: item, value: item }))}
          >
            <Input prefix={<UserOutlined />} size="large" />
          </AutoComplete>
        </Form.Item>

        <Form.Item
          label=""
          name="password"
          rules={[{ required: true, message: '请输入正确的密码!' }]}
        >
          <Input.Password prefix={<LockOutlined />} size="large" />
        </Form.Item>

        {/* <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item> */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: '48%', marginRight: '4%' }}
          >
            登录
          </Button>
          <Button
            loading={loading}
            size="large"
            style={{ width: '48%' }}
            onClick={() => onFinish({ userName: 'sany', password: '123' })}
          >
            访客
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
