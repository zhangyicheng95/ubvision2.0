import React, {} from 'react';
import { Form } from 'antd';

import styles from './index.module.less';

interface Props {
  stateData: any;
  dispatch: any;
}

const ShortcutPage: React.FC<Props> = (props: any) => {
  const [form] = Form.useForm();

  return (
    <div className={styles.shortcutPage}>
      {/* <Form form={form} scrollToFirstError={true}>
        <Form.Item
          name={'selfStarting'}
          label={'自启动'}
          valuePropName={'checked'}
          rules={[{ required: false, message: 'name' }]}
        >
          <Switch
            onChange={(val) => {
              // app.setLoginItemSettings({
              //   openAtLogin: val,
              // });
            }}
          />
        </Form.Item>
      </Form> */}
    </div>
  );
};

export default ShortcutPage;
