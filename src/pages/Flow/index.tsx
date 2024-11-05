import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete, Splitter } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import HeaderToolbar from './components/HeaderToolbar';
import PluginPanel from './components/PluginPanel';
import ConfigPanel from './components/ConfigPanel';
import CanvasPage from './components/Canvas';
import FooterToolbar from './components/FooterToolbar';

interface Props { }

const FlowPage: React.FC<Props> = (props: any) => {

  return (
    <div className={`flex-box-column ${styles.flowPage}`}>
      <HeaderToolbar />
      <div className="flex-box flow-page-body">
        <PluginPanel />
        <div className="flex-box-column flow-page-body-canvas">
          <Splitter>
            <Splitter.Panel>
              <CanvasPage />
            </Splitter.Panel>
            <Splitter.Panel defaultSize="40%" min="20%" max="60%">
              <ConfigPanel />
            </Splitter.Panel>
          </Splitter>
          <FooterToolbar />
        </div>
      </div>
    </div>
  );
};

export default FlowPage;
