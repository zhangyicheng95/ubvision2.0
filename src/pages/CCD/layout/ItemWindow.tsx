import React, { useMemo } from 'react';
import * as _ from 'lodash-es';
import { useDispatch, useSelector } from 'react-redux';
import { IRootActions } from '@/redux/actions';
import { Image, Divider, Form, Input, InputNumber } from 'antd';
import { guid } from '@/utils/utils';
import TooltipDiv from '@/components/TooltipDiv';
import ImageCharts from '../components/ImageCharts';
import dataItemImageNG from '@/assets/images/item-bg-ng.png';
import LineCharts from '../components/LineCharts';
import PieCharts from '../components/PieCharts';
import BarCharts from '../components/BarCharts';
import VideoCharts from '../components/VideoCharts';
import AudioCharts from '../components/AudioCharts';

interface Props {
    item: any;
}

const ItemWindow: React.FC<Props> = (props: any) => {
    const { canvasData } = useSelector((state: IRootActions) => state);
    const dispatch = useDispatch();
    const {
        data,
        item,
        setMyChartVisible,
        setLogDataVisible,
        snapshot,
        bodyBoxTab,
        formCustom,
        configForm,
        addWindow,
        removeWindow,
        loading, setLoadingAction,
        startProjects,
        endProjects,
        projectStatus,
        started,
    } = props;
    const ifCanEdit = useMemo(() => {
        return location.hash?.indexOf('edit') > -1;
    }, [location.hash]);
    const newGridContentList = !!localStorage.getItem(`localGridContentList-${canvasData.id}`)
        ? JSON.parse(localStorage.getItem(`localGridContentList-${canvasData.id}`) || '{}')
        : [];
    let {
        id,
        size,
        'sourceType-socket': __value = [],
        type,
        yName,
        xName,
        defaultImg,
        fontSize,
        reverse,
        direction,
        symbol,
        fetchType,
        ifFetch,
        fetchParams,
        align,
        hiddenAxis,
        labelInxAxis,
        labelDirection,
        barRadius,
        showBackground,
        showWithLine,
        backgroundColor = 'default',
        barColor = 'default',
        progressType = 'line',
        progressSize = 8,
        progressSteps = 5,
        des_bordered,
        des_column,
        des_layout,
        des_size,
        ifLocalStorage,
        alias: CCDName,
        imgs_width,
        imgs_height,
        tableSize,
        magnifier,
        comparison,
        operationList,
        dataZoom,
        fontColor,
        interlacing,
        modelRotate,
        modelScale,
        modelRotateScreenshot,
        password,
        passwordHelp,
        ifShowHeader,
        ifShowColorList,
        headerBackgroundColor,
        basicInfoData = [{ id: guid(), name: '', value: '' }],
        ifNeedClear,
        ifUpdateProject,
        ifUpdatetoInitParams,
        magnifierSize,
        listType,
        valueColor,
        blockType,
        blockTypeLines,
        modelUpload,
        xColumns,
        yColumns,
        platFormOptions,
        ifFetchParams,
        ifNeedAllow,
        lineNumber,
        columnNumber,
        magnifierWidth,
        magnifierHeight,
        ifPopconfirm,
        showImgList,
        notLocalStorage,
        imgListNum,
        showFooter,
        markNumberLeft,
        markNumberTop,
        line_height,
        staticHeight,
        fileTypes,
        fileFetch,
        paddingSize = '',
        titlePaddingSize = '',
        bodyPaddingSize = '',
        showLabel,
        titleBackgroundColor,
        titleFontSize = 20,
        valueOnTop = false,
        timeSelectDefault,
        iconSize,
        parentBodyBox,
        parentBodyBoxTab,
    } = item;
    paddingSize += '';
    titlePaddingSize += '';
    bodyPaddingSize += '';
    if (paddingSize?.indexOf('%') < 0 && paddingSize?.indexOf('px') < 0) {
        paddingSize = Number(paddingSize);
    };
    if (titlePaddingSize?.indexOf('%') < 0 && titlePaddingSize?.indexOf('px') < 0) {
        titlePaddingSize = Number(titlePaddingSize);
    };
    if (bodyPaddingSize?.indexOf('%') < 0 && bodyPaddingSize?.indexOf('px') < 0) {
        bodyPaddingSize = Number(bodyPaddingSize);
    };

    const gridValue = []?.filter((i: any) => i?.id === id)?.[0];
    const newGridValue = newGridContentList?.filter((i: any) => i?.id === id)?.[0];
    // socket有数据就渲染新的，没有就渲染localStorage缓存的
    const dataValue: any = gridValue?.[__value[1]] || newGridValue?.[__value[1]] || undefined;
    const parent = canvasData?.flowData?.nodes?.filter((i: any) => i.id === __value[0]);
    const { alias, name, ports } = parent?.[0] || {};
    const { items = [] } = ports || {};
    const SecLabel: any = items?.filter(
        (i: any) => i.group === 'bottom' && i?.label?.name === __value[1],
    )[0];

    return (
        <div
            key={id}
            className={`flex-box-column move-item-content-box`}
            // @ts-ignore
            style={Object.assign(
                {},
                { padding: paddingSize },
                ['imgButton', 'heatMap'].includes(type)
                    ? { backgroundColor: 'transparent' }
                    : ['default'].includes(backgroundColor)
                        ? {}
                        : backgroundColor === 'transparent'
                            ? { backgroundColor: 'transparent' }
                            : backgroundColor === 'black'
                                ? { backgroundColor: 'black' }
                                : {
                                    backgroundImage: `url(${type === 'img' && (dataValue?.status == 'NG' || dataValue?.status?.value == 'NG')
                                        ? dataItemImageNG
                                        : backgroundColor
                                        })`,
                                    backgroundColor: 'transparent',
                                },
                !!parentBodyBox && parentBodyBoxTab != bodyBoxTab ? { visibility: 'hidden' } : {},
            )}
        >
            {ifShowHeader ? (
                <div className="move-item-content-box-title-box flex-box" style={{ padding: titlePaddingSize, marginBottom: 0 }}>
                    <TooltipDiv className="flex-box move-item-content-box-title-box-title">
                        {`${CCDName || alias || name || '无效的节点'}`}
                        <span className="move-item-content-box-title-box-title-span">{(SecLabel?.label?.alias || __value[1]) ? `- ${(SecLabel?.label?.alias || __value[1])}` : ''}</span>
                    </TooltipDiv>
                </div>
            ) : null}
            <div className={`move-item-content-box-body-box`}>
                <div className="flex-box-center" style={{ height: '100%', padding: bodyPaddingSize }}>
                    {(!parent?.[0] && !item['sourceType-url']) &&
                        type?.indexOf('button') < 0 &&
                        ![
                            'header',
                            'slider-1',
                            'slider-4',
                            'footer-1',
                            'footer-2',
                            'bodyBox',
                            'form',
                            'switchBox',
                            'segmentSwitch',
                            'rangeDomain',
                            'rectRange',
                            'modelSwitch',
                            'iframe',
                            'timeSelect',
                            'img',
                            'audio',
                            'video'
                        ].includes(type) ?
                        `请绑定数据源-${item?.name}`
                        : type === 'line' ?
                            <LineCharts
                                id={id}
                                data={{}}
                            />
                            : type === 'pie' ?
                                <PieCharts
                                    id={id}
                                    data={{}}
                                />
                                : type === 'bar' ?
                                    <BarCharts
                                        id={id}
                                        data={{}}
                                    />
                                    : type === 'img' ?
                                        <ImageCharts
                                            id={id}
                                            data={{}}
                                        />
                                        : type === 'video' ?
                                            <VideoCharts
                                                id={id}
                                                data={{}}
                                            />
                                            : type === 'audio' ?
                                                <AudioCharts
                                                    id={id}
                                                    data={{}}
                                                />
                                                : null
                    }
                </div>
            </div>
        </div>
    );
};

export default ItemWindow;
