import React, { Fragment, useEffect } from 'react';
import { Popover, Tooltip } from 'antd';
import styles from './index.module.less';

interface Props {
  title?: any;
  content?: any;
  style?: any;
  placement?: any;
  onClick?: any;
  className?: string;
  id?: string;
  children: any;
}

const TooltipDiv: React.FC<Props> = (props: any) => {
  const {
    title = '', style = {}, children = null, placement = 'topLeft',
    onClick = null, className = '', ...rest
  } = props;
  return <Header {...props}>
    <div className={`${styles.toolTipDiv} ${className}`} style={({
      ...(onClick ? {
        cursor: 'pointer',
        color: '#177ddc'
      } : {}), ...style
    })} {...rest} onClick={onClick}>
      {children}
    </div>
  </Header>;
};

const Header = (props: any) => {
  const { children, title = '', content = '', placement = 'topLeft' } = props;
  if (title || content) {
    return <Popover title={title} content={content} placement={placement}>
      {children}
    </Popover>;
  }
  return <>
    {children}
  </>;

};

export default TooltipDiv;
