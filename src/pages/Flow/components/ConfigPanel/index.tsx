import React, { memo, useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';

interface Props { }

const ConfigPanel: React.FC<Props> = (props: any) => {

  return (
    <div className={`flex-box-column ${styles.configPanel}`}>
      
    </div>
  );
};

export default memo(ConfigPanel);
