import React, {  } from 'react';
import * as _ from 'lodash-es';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';

interface Props {
    dataList: any;
}

const CCDFooterPage: React.FC<Props> = (props: any) => {
    const { dataList } = props;
    const { canvasData, selectedNode } = useSelector((state: IRootActions) => state);
    const dispatch = useDispatch();


    return (
        <div className="flex-box ccd-page-footer-box">

        </div>
    );
};

export default CCDFooterPage;
