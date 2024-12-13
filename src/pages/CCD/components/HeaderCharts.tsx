import React, { Fragment, useMemo, useRef } from 'react';
import * as _ from 'lodash';
import styles from '../config/common.module.less';
import { Button, message } from 'antd';
import { BASE_IP } from '@/socket/consts';
import { updateParamsService } from '@/services/flowEditor';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { chooseFile } from '@/api/native-path';
import { ifCanEdit } from '@/utils/utils';
import TimeShowCharts from './TimeShowCharts';
import WeatherApp from '@/components/WeatherApp';

interface Props {
  data: any;
  id: any;
}

const HeaderCharts: React.FC<Props> = (props: any) => {
  const { data = {}, id, started = false } = props;
  let {
    fontSize = 16, titleFontSize = 24, iconSize = 16, des_layout = 'center', title, subTitle,
  } = data;
  const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
  const dispatch = useDispatch();
  const domRef = useRef<any>();

  // 图标
  const icon = useMemo(() => {
    return <img
      // @ts-ignore
      src={localStorage.getItem('quality_icon')?.indexOf('http') > -1 ?
        localStorage.getItem('quality_icon')
        :
        `${BASE_IP}file_browser${localStorage.getItem('quality_icon')?.indexOf('\\') === 0 ? '' : '\\'}${localStorage.getItem('quality_icon')}?__timestamp=${+new Date()}`}
      alt="logo"
      className="header-box-left-logo"
      style={{
        height: iconSize,
        minHeight: iconSize,
      }}
    />
  }, [iconSize]);

  // 上传更换logo
  const uploadLogo = () => {
    chooseFile(
      (res: any) => {
        const result = _.isArray(res) && res.length === 1 ? res[0] : res;
        const params = {
          ...canvasData,
          contentData: {
            ...canvasData?.contentData,
            quality_icon: result,
          },
        };
        updateParamsService(canvasData.id, params).then((res: any) => {
          if (res && res.code === 'SUCCESS') {
            localStorage.setItem('quality_icon', result);
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            message.error(
              res?.msg || res?.message || '后台服务异常，请重启服务',
            );
          }
        });
      },
      false,
      {
        name: 'File',
        extensions: ['jpg', 'jpeg', 'png', 'svg'],
      }
    );
  };

  return (
    <div
      id={`echart-${id}`}
      className={`flex-box ${styles.headerCharts}`}
      ref={domRef}
    >
      <div
        className="flex-box header-box-left"
        style={{
          fontSize,
          alignItems: des_layout,
        }}
      >
        {
          !!canvasData?.contentData?.showLogo ?
            !!localStorage.getItem('quality_icon') ?
              (canvasData?.contentData?.changeLogo && !ifCanEdit()) ?
                <div
                  onClick={() => uploadLogo()}
                >
                  {icon}
                </div>
                :
                icon
              :
              (canvasData?.contentData?.changeLogo && !ifCanEdit()) ?
                <div className="header-box-left-showLogo-but-none" onClick={() => uploadLogo()} />
                : null
            : null
        }
        <WeatherApp style={{ marginLeft: -16 }} />
        <div
          className="flex-box header-box-left-title"
          style={{ height: fontSize }}
        >
          {subTitle}
        </div>
      </div>
      <div className="header-box-title" style={{ fontSize: titleFontSize }}>{title}</div>
      <div
        className="flex-box-justify-end header-box-right"
        style={{
          fontSize,
          alignItems: des_layout,
        }}
      >
        <TimeShowCharts />
      </div>
    </div>
  );
};

export default HeaderCharts;
