import React, { useEffect, useState } from 'react';
import { InputNumber } from 'antd';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  OneToOneOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

interface Props {
}

const MiniMapPanel: React.FC<Props> = (props) => {
  const { graphData, canvasData, canvasStart } = useSelector((state: IRootActions) => state);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [inputToMiniMapZoom, setInputToMiniMapZoom] = useState(false);
  const [miniMapZoom, setMiniMapZoom] = useState(1);

  useEffect(() => {
    if (!!canvasData?.zoom) {
      setMiniMapZoom(Number(canvasData.zoom));
    }
  }, [canvasData?.zoom]);

  return (
    <div className={`${styles.minimapPanel} flex-box-column`}>
      <div className="map-toolbar flex-box">
        <ZoomOutOutlined
          className="toolbar-btn"
          onClick={() => {
            const zoomCur = graphData.zoom();
            const zoomto = Math.max(Number((zoomCur - 0.1).toFixed(2)), 0.05);
            if (zoomto >= 0.05) {
              graphData.zoomTo(zoomto);
              setMiniMapZoom(zoomto);
            }
          }}
        />
        {inputToMiniMapZoom ? (
          <InputNumber
            autoFocus
            value={Number(miniMapZoom)}
            max={2}
            min={0.05}
            step={0.05}
            style={{ width: 60 }}
            onBlur={() => { return setInputToMiniMapZoom(false) }}
            onChange={(value: any) => {
              graphData.zoomTo(value);
              setMiniMapZoom(value);
            }}
          />
        ) : (
          <div
            className="toolbar-btn zoom-font"
            onClick={() => { return setInputToMiniMapZoom(true) }}
          >
            {(miniMapZoom * 100).toFixed(0)}%
          </div>
        )}
        <ZoomInOutlined
          className="toolbar-btn"
          onClick={() => {
            const zoomCur = graphData.zoom();
            const zoomto = Math.min(Number((zoomCur + 0.1).toFixed(1)), 2);
            if (zoomto <= 2.0) {
              graphData.zoomTo(zoomto);
              setMiniMapZoom(zoomto);
            }
          }}
        />
        <OneToOneOutlined
          className="toolbar-btn"
          onClick={() => {
            graphData.zoomToFit({ absolute: true, maxScale: 1 });
            setTimeout(() => {
              const zoomCur = graphData.zoom();
              setMiniMapZoom(zoomCur);
            }, 200);
          }}
        />
        {!showMiniMap ? (
          <EyeOutlined
            className="toolbar-btn"
            onClick={() => {
              setShowMiniMap(true);
            }}
          />
        ) : (
          <EyeInvisibleOutlined
            className="toolbar-btn"
            onClick={() => {
              setShowMiniMap(false);
            }}
          />
        )}
      </div>
      <div
        className="mini-map-top"
        style={showMiniMap ? {} : { display: 'none' }}
      >
        <div id="mini-map" />
      </div>
    </div>
  );
};

export default MiniMapPanel;
