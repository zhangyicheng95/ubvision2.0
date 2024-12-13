import React, { memo, useEffect, useState } from 'react';
import { Modal, Image, Skeleton } from 'antd';
import styles from '../config/common.module.less';
import * as _ from 'lodash';

interface Props {
    id: string;
    data: object;
}

const AudioCharts: React.FC<Props> = (props: any) => {
    const { id, data } = props;
    let {
        fontSize, dataValue = "", autoPlay = false
    } = data;
    if (process.env.NODE_ENV === 'development') {
        dataValue = "https://v.jgvogel.cn/40b7ac1e6695486ab1b5cdf0f18061c8/5fff45d59527495a90cec7c324b0b8c5-3764b8141e0befbc736d86eb4d1371b9-fd.mp4";
    }

    return (
        <div id={`chart-${id}`} className={`flex-box-center ${styles.audioCharts}`} style={{ fontSize }}>
            <audio src={dataValue} autoPlay={autoPlay} controls loop muted playsInline></audio>
        </div>
    );

};

export default memo(AudioCharts);