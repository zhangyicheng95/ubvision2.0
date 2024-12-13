import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Modal, Image, Skeleton } from 'antd';
import * as echarts from 'echarts';
import styles from '../config/common.module.less';
import * as _ from 'lodash';
import moment from 'moment';

interface Props {
    id: string;
    data: object;
}

const BarCharts: React.FC<Props> = (props: any) => {
    const { id, data } = props;
    let { dataValue = [], fontSize, yName, xName = '', dataZoom } = data;
    const domRef = useRef<any>();
    const myChartRef = useRef<any>();
    if (process.env.NODE_ENV === 'development') {
        dataValue = [
            {
                "name": "破损",
                "value": 6
            },
            {
                "name": "漆粒子",
                "value": 0
            },
            {
                "name": "漆瘤",
                "value": 0
            },
            {
                "name": "漆坑",
                "value": 0
            },
            {
                "name": "气泡",
                "value": 0
            },
            {
                "name": "色差",
                "value": 0
            },
            {
                "name": "色斑",
                "value": 0
            },
            {
                "name": "划伤",
                "value": 0
            }
        ];
    };

    const windowResize = () => {
        myChartRef.current?.resize({
            width: domRef.current?.clientWidth,
            height: domRef.current?.clientHeight,
        });
    };
    useEffect(() => {
        if (!!domRef.current) {
            myChartRef.current = echarts.init(domRef.current);
            window.addEventListener('resize', windowResize);
        }
        return () => {
            window.removeEventListener('resize', windowResize);
            myChartRef.current && myChartRef.current?.dispose();
        };
    }, []);

    return (
        <Fragment>
            <div style={{ width: '100%', height: '100%' }} id={`echart-${id}`} ref={domRef} />
        </Fragment>
    );

};

export default memo(BarCharts);