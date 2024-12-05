import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, message, Input, AutoComplete } from 'antd';
import {
    SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash-es';
import styles from './index.module.less';
import { GetQueryObj, guid } from '@/utils/utils';
import { getParams, updateParams } from '@/services/flowEditor';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DropSortableItem from '@/components/DragComponents/DropSortableItem';
import Moveable from 'react-moveable';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions, setCanvasData, setLoading, setSelectedNode } from '@/redux/actions';
import { useCallback } from 'react';

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
