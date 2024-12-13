import React, { memo, useEffect, useState } from 'react';
import { Modal, Image, Skeleton } from 'antd';
import * as echarts from 'echarts';
import styles from '../config/common.module.less';
import * as _ from 'lodash';
import moment from 'moment';

interface Props {
    id: string;
    data: object;
}

const LineCharts: React.FC<Props> = (props: any) => {
    const { id, data } = props;
    let { dataValue = [], fontSize, yName, xName = '', dataZoom } = data;
    if (process.env.NODE_ENV === 'development') {
        let base = +new Date(1988, 9, 3);
        let oneDay = 24 * 3600 * 1000;
        let data: any = [[moment(base).format('HH:mm:ss'), Math.random() * 300]];
        for (let i = 1; i < 120; i++) {
            let now = new Date((base += 1000 * i));
            data.push([
                moment(now).format('HH:mm:ss'),
                Math.round((Math.random() - 0.5) * 20 + data[i - 1][1]),
            ]);
        }

        dataValue = [
            {
                name: '上限',
                value: 7.2,
                type: 'markLine',
            },
            {
                name: '标准值',
                value: 2,
                type: 'markLine',
            },
            {
                name: '下限',
                value: -17.53,
                type: 'markLine',
            },
            {
                name: 'data1',
                color: 'black',
                value: data,
                // [
                //   [moment(new Date()).format('HH:mm:ss'), 0],
                //   [111, 0.4334124762809495],
                //   [112, -0.9606118392109693],
                //   [113, -0.13445980061443663],
                //   [114, 0.2657699517356775],
                //   [115, 0.10325138152127522],
                //   [116, 0.28377655413461866],
                //   [117, 0.08464055396447634],
                //   [118, 0.2651657265786582],
                //   [119, 0.1758820162761623],
                //   [120, 0.2831723289785941],
                //   [121, 0.01080146889621858],
                //   [122, 0.08147435164281092],
                //   [123, 0.39498237085557264],
                //   [124, 0],
                //   [125, -15.076183898115644],
                //   [126, -0.0655995933370832],
                //   [127, 0.5408478655230766],
                //   [128, 0.09887672888672228],
                //   [129, 0.30253245823122654],
                //   [130, 0.1901181911975982],
                //   [131, -0.15548752879649896],
                //   [132, 0.5010642332452448],
                //   [133, -0.32056807617654215],
                //   [134, 0.5556882656011339],
                //   [135, 0.06361282578291139],
                //   [136, 0.28075542835344436],
                //   [137, 0.7041157374339946],
                //   [138, 0.7015537602689506],
                //   [139, -0.8890445782283933],
                // ],
            },
            // {
            //     "name": "data2",
            //     "value": data
            // }
        ];
    }
    return (
        <div id={`chart-${id}`} className={`flex-box-center ${styles.lineCharts}`} style={{ fontSize }}>

        </div>
    );

};

export default memo(LineCharts);