import React, { memo, useEffect, useState } from 'react';
import styles from './common.module.less';
import * as _ from 'lodash';
import { Modal, Image, Skeleton } from 'antd';

interface Props {
    id: string;
    data: object;
}

const ImageCharts: React.FC<Props> = (props: any) => {
    const { id, data } = props;
    const { fontSize, dataValue } = data;

    return (
        <div id={`chart-${id}`} className={`flex-box-center ${styles.imageCharts}`} style={{ fontSize }}>
            {
                !!dataValue ?
                    <Image />
                    :
                    <Skeleton.Image active={true} />
            }
        </div>
    );

};

export default memo(ImageCharts);