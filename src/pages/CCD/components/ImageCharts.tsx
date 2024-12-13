import React, { memo, useEffect, useRef, useState } from 'react';
import { Modal, Image, Skeleton } from 'antd';
import styles from '../config/common.module.less';
import * as _ from 'lodash';

interface Props {
    id: string;
    data: object;
}

const ImageCharts: React.FC<Props> = (props: any) => {
    const { id, data } = props;
    let {
        fontSize, dataValue, showImgList, showFooter
    } = data;
    if (process.env.NODE_ENV === 'development') {
        dataValue = "https://th.bing.com/th/id/R.22ae499c7c99289ef333b02bf640b822?rik=MkOhaz4Fe4DSQg&riu=http%3a%2f%2fwww.fdbusiness.com%2fwp-content%2fuploads%2f2015%2f06%2fSternMaidJune2015-680x365_c.jpg&ehk=zuoZKfrcto%2f0INs9UHPLw9HILlz%2fzPB6GGfRKFQPiHk%3d&risl=&pid=ImgRaw&r=0";
    };
    const dom = useRef<any>();
    const imgBoxRef = useRef<any>();
    const urlList = useRef<any>([]);
    const [selectedNum, setSelectedNum] = useState<any>(0);
    const [chartSize, setChartSize] = useState(true);
    const [imgOriginalSize, setImgOriginalSize] = useState({ width: 1, height: 1 });

    useEffect(() => {
        if (!!dom?.current?.clientWidth) {
            // 滚轮缩放
            let img: any = document.createElement('img');
            const source = urlList.current?.[selectedNum] || dataValue;
            img.src = _.isString(source) ? source : source?.url;
            img.title = 'img.png';
            img.onload = (res: any) => {
                const { width = 1, height = 1 } = img;
                setImgOriginalSize({ width, height });
                setChartSize(width / height > dom?.current?.clientWidth / dom?.current?.clientHeight);
            };
        }
    }, [dataValue]);

    return (
        <div id={`chart-${id}`} className={`flex-box-center ${styles.imageCharts}`} style={{ fontSize }}>
            <div
                className="flex-box img-box-mark-body"
                style={showImgList ? { height: 'calc(100% - 50px)' } : !!showFooter ? { height: 'calc(100% - 24px)' } : { height: '100%' }}
                ref={dom}
            >
                {
                    !!dataValue ?
                        <img
                            src={dataValue}
                            alt="logo"
                            style={
                                chartSize
                                    ? { width: '100%', height: 'auto' }
                                    : { width: 'auto', height: '100%' }
                            }
                        />
                        :
                        <Skeleton.Image active={true} />
                }
            </div>
        </div>
    );

};

export default memo(ImageCharts);