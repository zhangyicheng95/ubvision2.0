import { Checkbox } from 'antd';
import styles from './index.module.less';

const BasicConfirm = (props: any) => {
  const {
    children = null,
    ifAllOk,
    ifAllOkClick = null,
    className = '',
    ...rest
  } = props;
  return (
    <div className={`${styles.basicConfirm} ${className}`} {...rest}>
      <div style={{ marginBottom: 8 }}>{children}</div>
      {!!ifAllOk ? (
        <Checkbox onChange={(e: any) => ifAllOkClick(e.target.checked)}>
          全部执行此操作
        </Checkbox>
      ) : null}
    </div>
  );
};

export default BasicConfirm;
