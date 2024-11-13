import React, { Fragment, memo, useMemo } from 'react';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

interface Props { }

const ConfigPanel: React.FC<Props> = (props: any) => {
  const { selectedNode, canvasData, canvasStart } = useSelector((state: IRootActions) => state);

  const nodeConfig = useMemo<any>(() => {
    const { nodes } = canvasData?.flowData || {};
    const selected = nodes?.filter((i: any) => i?.customId === selectedNode);
    return selected?.[0] || null;
  }, [JSON.stringify(canvasData?.flowData?.nodes), selectedNode])

  return (
    <div className={`flex-box-column ${styles.configPanel}`}>
      {
        useMemo(() => {
          console.log('config', nodeConfig);
          return (selectedNode?.indexOf('node_') > -1 && !!nodeConfig) ?
            <Fragment>
              <div className="info-box">
                <h2>{nodeConfig.name}</h2>
                <p>节点ID: {nodeConfig?.customId}</p>
                <p>版本号: {nodeConfig.version}</p>
                <p>模块: {nodeConfig?.config?.module}</p>
                {/* <p>描述：{info.description}</p> */}
              </div>
            </Fragment>
            :
            <code>{`{"name": 123, "age": 22}`}</code>
        }, [nodeConfig, selectedNode])
      }
    </div>
  );
};

export default memo(ConfigPanel);
