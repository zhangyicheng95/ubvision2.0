import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';

interface Props { }

const PluginPanel: React.FC<Props> = (props: any) => {

  return (
    <div className={`flex-box-column ${styles.pluginPanel}`}>

    </div>
  );
};

export default PluginPanel;
