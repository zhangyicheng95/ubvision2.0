import React, { Fragment, memo, useLayoutEffect } from 'react';
import { message, Splitter } from 'antd';
import { Portal } from '@antv/x6-react-shape';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import HeaderToolbar from './components/HeaderToolbar';
import PluginPanel from './components/PluginPanel';
import ConfigPanel from './components/ConfigPanel';
import CanvasFlow from './components/CanvasFlow';
import FooterToolbar from './components/FooterToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setCanvasDataBase, setCanvasPlugins, setCanvasStart, setLoading } from '@/redux/actions';
import { generalConfigList } from './common/constants';
import { GetQueryObj, guid } from '@/utils/utils';
import { getPluginList } from '@/services/flowPlugin';
import { getFlowStatusService, getParams } from '@/services/flowEditor';

const X6ReactPortalProvider = Portal.getProvider(); // 注意，一个 graph 只能申明一个 portal provider
interface Props { }

const FlowPage: React.FC<Props> = (props: any) => {
  const { projectList } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const params: any = !!location.search
    ? GetQueryObj(location.search)
    : !!location.href
      ? GetQueryObj(location.href)
      : {};
  const id = params?.['id'];
  const number = params?.['number'];

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
                const cen = {
                  direction: 'input',
                  name: top[0],
                  ...top[1],
                  sort: index,
                };
                return {
                  customId: `port_${guid()}`,
                  group: 'top',
                  ...cen,
                  label: cen
                };
              }
            );
            const bottomPorts = Object.entries(config?.output || {})?.map?.(
              (bottom: any, index) => {
                const cen = {
                  direction: 'output',
                  name: bottom[0],
                  ...bottom[1],
                  sort: Object.keys(config?.input)?.length + index,
                };
                return {
                  customId: `port_${guid()}`,
                  group: 'bottom',
                  ...cen,
                  label: cen
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
                ports: {
                  groups: {
                    "top": {
                      "position": "top",
                      "attrs": {
                        "fo": {
                          "r": 6,
                          "magnet": true,
                          "strokeWidth": 1,
                          "fill": "#fff"
                        }
                      }
                    },
                    "bottom": {
                      "position": "bottom",
                      "attrs": {
                        "fo": {
                          "r": 6,
                          "magnet": true,
                          "strokeWidth": 1,
                          "fill": "#fff"
                        }
                      }
                    }
                  },
                  items: topPorts.concat(bottomPorts),
                }
              },
              ports: {
                groups: {
                  "top": { "position": "top", "attrs": { "fo": { "r": 6, "magnet": true, "strokeWidth": 1, "fill": "#fff" } } }, "bottom": { "position": "bottom", "attrs": { "fo": { "r": 6, "magnet": true, "strokeWidth": 1, "fill": "#fff" } } }
                },
                items: topPorts.concat(bottomPorts),
              }
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
  useLayoutEffect(() => {
    getPlugin();
  }, []);
  useLayoutEffect(() => {
    if (id) {
      dispatch(setLoading(true));
      // 拉取数据
      getParams(id).then((res) => {
        if (!!res && res.code === 'SUCCESS') {
          // 获取任务状态
          getFlowStatusService(id).then((resStatus: any) => {
            if (!!resStatus && resStatus.code === 'SUCCESS') {
              dispatch(setCanvasData(res?.data || {}));
              dispatch(setCanvasDataBase(res?.data || {}));
              dispatch(setCanvasStart(!!resStatus?.data && !!Object.keys?.(resStatus?.data)?.length));
            } else {
              dispatch(setCanvasStart(false));
              message.error(
                resStatus?.msg || resStatus?.message || '接口异常'
              );
            };
          });
        } else {
          message.error(res?.message || '接口异常');
        }
      });
    }
  }, [id]);

  return (
    <div className={`flex-box-column ${styles.flowPage}`}>
      <Fragment>
        <HeaderToolbar />
        <div className="flex-box flow-page-body">
          <Splitter>
            <Splitter.Panel defaultSize="15%" min="5%" max="30%">
              <PluginPanel />
            </Splitter.Panel>
            <Splitter.Panel>
              <CanvasFlow />
            </Splitter.Panel>
            <Splitter.Panel defaultSize="50%" min="10%" max="80%">
              <ConfigPanel />
            </Splitter.Panel>
          </Splitter>
        </div>
        <FooterToolbar />
      </Fragment>
    </div>
  );
};

export default memo(FlowPage);
