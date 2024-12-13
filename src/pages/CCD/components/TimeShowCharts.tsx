import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { Modal, Image, Skeleton } from 'antd';
import styles from '../config/common.module.less';
import * as _ from 'lodash';
import useClock from '@/hooks/useClock';

interface Props {

}

const TimeShowCharts: React.FC<Props> = (props: any) => {
    const { time } = useClock();

    return <div>{time}</div>;

};

export default memo(TimeShowCharts);