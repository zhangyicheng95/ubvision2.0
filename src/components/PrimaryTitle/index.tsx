import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Input, Button } from 'antd';
import { useLocation } from 'react-router-dom';

import styles from './index.module.less';

interface Props {
  title: any;
  style?: any;
  onSearch?: any;
  onClick?: any;
  children?: any;
}

const PrimaryTitle: React.FC<Props> = (props: any) => {
  const { title, children, style, onSearch = null, onClick = null } = props;
  const { pathname = '/home' } = useLocation();
  const inputRef = React.useRef<any>(null);
  const [searchFocus, setSearchFocus] = useState(false);
  useEffect(() => {
    // 路由变化时，清空搜索框
    !!inputRef.current && inputRef.current?.state?.value && (inputRef.current.state.value = undefined);
  }, [pathname]);

  return (
    <div
      className={`${styles.primaryTitle} flex-box`}
      style={Object.assign({ gap: 8 }, onClick ? { cursor: 'pointer' } : {}, style)}
    >
      <div className="title" onClick={() => onClick && onClick()}>
        {title}
      </div>
      {onSearch ? (
        <Input.Search
          ref={inputRef}
          className={`input-box ${searchFocus ? 'onfocus' : ''}`}
          style={children ? {} : { marginRight: 0 }}
          allowClear
          onFocus={() => {
            return setSearchFocus(true);
          }}
          onBlur={() => {
            return setSearchFocus(false);
          }}
          onSearch={onSearch}
        />
      ) : null}
      {children}
    </div>
  );
};

export default PrimaryTitle;
