import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete, Splitter } from 'antd';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import HeaderToolbar from './components/HeaderToolbar';
import PluginPanel from './components/PluginPanel';
import ConfigPanel from './components/ConfigPanel';
import CanvasPage from './components/Canvas';
import FooterToolbar from './components/FooterToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasPlugins } from '@/redux/actions';
import { generalConfigList, portTypeObj } from './common/constants';
import { guid } from '@/utils/utils';
import { getPluginList } from '@/services/flowPlugin';

interface Props { }

const FlowPage: React.FC<Props> = (props: any) => {
  const { loading, projectList } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  // 获取侧边栏配置算子列表
  const getPlugin = () => {
    return new Promise((resolve: any, reject: any) => {
      // pluginApi.list().then((res: any) => {
      getPluginList().then((res: any) => {
        if (!!res && res.code === 'SUCCESS') {
          const result = (res.data || []).reduce((prev: any, cent: any) => {
            const { config = {} } = cent;
            if (!cent.category) {
              cent['category'] = '未命名';
            }
            const topPorts = Object.entries(config?.input || {})?.map?.(
              (top: any, index) => {
                return {
                  customId: `port_${guid()}`,
                  group: 'top',
                  label: {
                    direction: 'input',
                    name: top[0],
                    ...top[1],
                    sort: index,
                  },
                  color: portTypeObj[top[1].type]?.color || portTypeObj.default,
                };
              }
            );
            const bottomPorts = Object.entries(config?.output || {})?.map?.(
              (bottom: any, index) => {
                return {
                  customId: `port_${guid()}`,
                  group: 'bottom',
                  label: {
                    direction: 'output',
                    name: bottom[0],
                    ...bottom[1],
                    sort: index,
                  },
                  color:
                    portTypeObj[bottom[1].type]?.color || portTypeObj.default,
                };
              }
            );
            const id = `node_${guid()}`;
            const item: any = {
              // id: id,
              data: {
                ...cent,
                config: {
                  ...cent.config,
                  generalConfig: {
                    ...(!!cent.config?.generalConfig
                      ? Object.entries(generalConfigList)?.reduce(
                        (pre: any, cen: any) => {
                          return Object.assign({}, pre, {
                            [cen[0]]: {
                              ...cen[1],
                              ...(!!cent.config?.generalConfig[cen[0]]
                                ? {
                                  value:
                                    cent.config?.generalConfig[cen[0]]
                                      ?.value,
                                }
                                : {}),
                            },
                          });
                        },
                        {}
                      )
                      : generalConfigList),
                  },
                },
                ifShow: true,
              },
              ports: topPorts.concat(bottomPorts),
            };
            return {
              ...prev,
              ...(cent.category
                ? {
                  [cent.category]: _.has(prev, cent.category)
                    ? prev[cent.category].concat(item)
                    : [].concat(item),
                }
                : {}),
            };
          }, {});
          dispatch(setCanvasPlugins(result));
          resolve(result);

        } else {
          message.error(res?.message || '接口异常');
        }
      });
    });
  };
  useEffect(() => {
    getPlugin();
  }, []);

  return (
    <div className={`flex-box-column ${styles.flowPage}`}>
      <HeaderToolbar />
      <div className="flex-box flow-page-body">
        <Splitter>
          <Splitter.Panel defaultSize="15%" min="10%" max="30%">
            <PluginPanel />
          </Splitter.Panel>
          <Splitter.Panel>
            <CanvasPage />
          </Splitter.Panel>
          <Splitter.Panel defaultSize="30%" min="10%" max="60%">
            <ConfigPanel />
          </Splitter.Panel>
        </Splitter>
      </div>
      <FooterToolbar />
    </div>
  );
};

export default FlowPage;
