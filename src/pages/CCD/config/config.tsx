import {
    BarChartOutlined, CommentOutlined, EnvironmentOutlined, TableOutlined, ClusterOutlined, EllipsisOutlined, PlaySquareOutlined,
} from '@ant-design/icons';

export const windowTypeList = [
    {
        label: '图表',
        value: 'charts',
        icon: <BarChartOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
            {
                label: '柱状图',
                value: 'bar',
            },
            {
                label: '折线图',
                value: 'line',
            },
            {
                label: '散点图',
                value: 'point',
            },
            {
                label: '饼环图',
                value: 'pie',
            },
        ],
        contents: [
            {
                value: 'line',
                label: '折线趋势图窗口',
                type: 'charts',
            },
            {
                value: 'point',
                label: '散点图窗口',
                type: 'charts',
            },
            {
                value: 'bar',
                label: '柱状图窗口',
                type: 'charts',
            },
            {
                value: 'pie',
                label: '饼状图窗口',
                type: 'charts',
            },
            {
                value: 'pie3D',
                label: '3D饼状图窗口',
                type: 'charts',
            },
            {
                value: 'nightingalePie',
                label: '南丁格尔图窗口',
                type: 'charts',
            },
        ]
    },
    {
        label: '地图',
        value: 'map',
        icon: <EnvironmentOutlined className='icon' />,
        types: [],
        contents: []
    },
    {
        label: '信息',
        value: 'info',
        icon: <CommentOutlined className='icon' />,
        types: [],
        contents: []
    },
    {
        label: '表格',
        value: 'table',
        icon: <TableOutlined className='icon' />,
        types: [],
        contents: []
    },
    {
        label: '控件',
        value: 'control',
        icon: <ClusterOutlined className='icon' />,
        types: [],
        contents: []
    },
    {
        label: '媒体',
        value: 'video',
        icon: <PlaySquareOutlined className='icon' />,
        types: [],
        contents: []
    },
    {
        label: '其他',
        value: 'other',
        icon: <EllipsisOutlined className='icon' />,
        types: [],
        contents: []
    }
]