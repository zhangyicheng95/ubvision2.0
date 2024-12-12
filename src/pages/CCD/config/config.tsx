import {
    BarChartOutlined, ProfileOutlined, EnvironmentOutlined, TableOutlined,
    ClusterOutlined, EllipsisOutlined, PlaySquareOutlined, LayoutOutlined,
    FundOutlined, AimOutlined,
} from '@ant-design/icons';
import homeBg from '@/assets/images/home-bg.png'

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
                type: 'line',
            },
            {
                value: 'point',
                label: '散点图窗口',
                type: 'point',
            },
            {
                value: 'bar',
                label: '柱状图窗口',
                type: 'bar',
            },
            {
                value: 'pie',
                label: '饼状图窗口',
                type: 'pie',
            },
            {
                value: 'pie3D',
                label: '3D饼状图窗口',
                type: 'pie',
            },
            {
                value: 'nightingalePie',
                label: '南丁格尔图窗口',
                type: 'pie',
            },
        ]
    },
    {
        label: '布局',
        value: 'layout',
        icon: <LayoutOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
        ],
        contents: [
            {
                value: 'header',
                label: '数据头部',
                type: 'header',
            },
        ]
    },
    {
        label: '信息',
        value: 'info',
        icon: <ProfileOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
            {
                label: '文本',
                value: 'info',
            },
            {
                label: '进度',
                value: 'progress',
            },
        ],
        contents: [
            {
                value: 'status',
                label: '状态窗口',
                type: 'info',
            },
            {
                value: 'description',
                label: '描述窗口',
                type: 'info',
            },
            {
                value: 'statistic',
                label: '文本展示窗口',
                type: 'info',
            },
            {
                value: 'logAlert',
                label: '日志socket窗口',
                type: 'info',
            },
            {
                value: 'progress',
                label: '进度条组件',
                type: 'progress',
            },
            {
                value: 'countdown',
                label: '倒计时窗口',
                type: 'progress',
            },
        ]
    },
    {
        label: '表格',
        value: 'table',
        icon: <TableOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
        ],
        contents: [
            {
                value: 'table',
                label: '双列表格窗口',
                type: 'table',
            },
            {
                value: 'table2',
                label: '通用表格窗口',
                type: 'table',
            },
            {
                value: 'table3',
                label: '多分组表格窗口',
                type: 'table',
            },
            {
                value: 'table4',
                label: '树形表格窗口',
                type: 'table',
            },
            {
                value: 'table5',
                label: '分页表格窗口',
                type: 'table',
            },
            {
                value: 'tableAntd',
                label: 'antd表格',
                type: 'table',
            },
        ]
    },
    {
        label: '控件',
        value: 'control',
        icon: <ClusterOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
            {
                label: '选择',
                value: 'select',
            },
            {
                label: '按钮',
                value: 'button',
            },
            {
                label: '开关',
                value: 'switch',
            },
            {
                label: '操作',
                value: 'operation',
            },
            {
                label: '提示',
                value: 'alert',
            },
        ],
        contents: [
            {
                value: 'timeSelect',
                label: '时间选择组件',
                type: 'select',
            },
            {
                value: 'optionSelect',
                label: '下拉框选择组件',
                type: 'select',
            },
            {
                value: 'button',
                label: '按钮组件',
                type: 'button',
            },
            {
                value: 'buttonInp',
                label: '参数按钮组件',
                type: 'button',
            },
            {
                value: 'buttonPassword',
                label: '密码按钮组件',
                type: 'button',
            },
            {
                value: 'buttonUpload',
                label: '文件路径选择组件',
                type: 'button',
            },
            {
                value: 'buttonOpen',
                label: '文件路径打开组件',
                type: 'button',
            },
            {
                value: 'switchBox',
                label: '批量启停窗口',
                type: 'switch',
            },
            {
                value: 'segmentSwitch',
                label: '开关组件',
                type: 'switch',
            },
            {
                value: 'operation',
                label: '功能操作窗口',
                type: 'operation',
            },
            {
                value: 'operation2',
                label: '动态操作窗口',
                type: 'operation',
            },
            {
                value: 'form',
                label: '自定义表单',
                type: 'operation',
            },
            {
                value: 'modal',
                label: '弹窗组件窗口',
                type: 'alert',
            },
        ]
    },
    {
        label: '媒体',
        value: 'medium',
        icon: <PlaySquareOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
            {
                label: '图片',
                value: 'img',
            },
            {
                label: '视频',
                value: 'video',
            },
            {
                label: '音频',
                value: 'audio',
            },
        ],
        contents: [
            {
                value: 'img',
                label: '图片窗口',
                type: 'img',
            },
            {
                value: 'video',
                label: '视频窗口',
                type: 'video',
            },
            {
                value: 'audio',
                label: '音频窗口',
                type: 'audio',
            },
        ]
    },
    {
        label: '背景图',
        value: 'background',
        icon: <FundOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
            {
                label: '背景图',
                value: 'img',
            },
            {
                label: '背景色',
                value: 'color',
            },
        ],
        contents: [
            {
                value: homeBg,
                icon: homeBg,
                label: '大屏背景图',
                type: 'img',
            },
            {
                value: '',
                label: '默认背景色',
                type: 'color',
            },
        ]
    },
    {
        label: '标注',
        value: 'platForm',
        icon: <AimOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
        ],
        contents: [
            {
                value: 'platForm',
                label: '图片标注窗口',
                type: 'module',
            },
            {
                value: 'three',
                label: '3D窗口',
                type: 'three',
            },
            {
                value: 'fabric',
                label: '尺寸测量标注窗口',
            },
            {
                value: 'reJudgment',
                label: '人工复判窗口',
            },
        ]
    },
    {
        label: '其他',
        value: 'other',
        icon: <EllipsisOutlined className='icon' />,
        types: [
            {
                label: '全部',
                value: 'all',
            },
        ],
        contents: []
    },
]