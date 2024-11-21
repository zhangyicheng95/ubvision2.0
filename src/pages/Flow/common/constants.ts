import * as _ from 'lodash-es';

// 连线类型
const commonLine = {
    attrs: {
        line: {
            stroke: '#1c5050',
            strokeWidth: 3,
            sourceMarker: 'block',
            targetMarker: {
                name: 'classic',
            },
        },
    },
    connector: {
        name: 'normal',  // normal:简单连接器; smooth:平滑连接器; rounded:圆角连接器; jumpover:跳线连接器
        args: {
            type: 'cubic',
            size: 10,
        },
    },
}
export const edgeType: any = {
    er: {
        router: {
            name: 'er', // 90度折角
            args: {
                offset: 'center',
                direction: 'B'
            },
        },
        ...commonLine
    },
    metro: {
        router: {
            name: 'metro', // 类似电路图
            args: {
                startDirections: ['bottom'],
                endDirections: ['top'],
                padding: 80
            },
        },
        ...commonLine
    },
    straight: { // 直线
        ...commonLine,
        router: {}
    },
    curve: {
        ..._.omit(commonLine, 'connector'),
        router: undefined,
        connector: undefined,
    }
}
// 节点状态变化-动画
export const normalColor = ['STARTING', 'RUNNING', 'STOPPING'];
export const errorColor = ['EXITED', 'FATAL', 'ERROR', 'ERRORED', 'CREATED', 'CRITICAL'];
export const warningColor = ['UNKNOWN'];
export const portTypeObj: any = {
    string: {
        color: '#165b5c',
        title: 'string数据',
        type: 'string',
    },
    int: {
        color: '#7a3f59',
        title: 'int数据',
        type: 'int',
    },
    float: {
        color: '#553a46',
        title: 'float数据',
        type: 'float',
    },
    bool: {
        color: '#7d573a',
        title: 'bool数据',
        type: 'bool',
    },
    list: {
        color: '#694256',
        title: 'list数据',
        type: 'list',
    },
    dict: {
        color: '#425e7e',
        title: '文件夹',
        type: 'dict',
    },
    'numpy.ndarray': {
        color: '#1acccf',
        title: 'num list数据',
        type: 'dict',
    },
    any: {
        color: '#a1b2c3',
        title: '任意类型',
        type: 'dict',
    },
    default: '#4b5054',
};
export const portTypeList = ['file', 'int', 'float', 'bool', 'dir'];
export const outputTypeObj: any = {
    string: [
        {
            widget: 'Input',
            title: 'Input 普通输入框',
        },
        {
            widget: 'IpInput',
            title: 'IpInput 输入框',
        },
        {
            widget: 'codeEditor',
            title: 'Code 代码编辑器',
        },
    ],
    int: [
        {
            widget: 'InputNumber',
            title: 'InputNumber 数值输入框',
        },
        {
            widget: 'Slider',
            title: 'Slider 滑块输入框',
        },
        {
            widget: 'DatePicker',
            title: 'DatePicker 时间选择器',
        },
        // {
        //   widget: 'Radio',
        //   title: 'Radio 单项选择框',
        // },
    ],
    float: [
        {
            widget: 'InputNumber',
            title: 'InputNumber 数值输入框',
        },
        {
            widget: 'Slider',
            title: 'Slider 滑块输入框',
        },
        {
            widget: 'Measurement',
            title: 'Measurement 标定参数',
        },
    ],
    bool: [
        {
            widget: 'Switch',
            title: 'Switch 开关选择器',
        },
    ],
    'List[string]': [
        {
            widget: 'Radio',
            title: 'Radio 单项选择框',
        },
        {
            widget: 'Select',
            title: 'Select 单项选择框',
        },
        {
            widget: 'TagRadio',
            title: 'TagRadio 组合单项选择框',
        },
        {
            widget: 'MultiSelect',
            title: 'MultiSelect 多项选择框',
        },
        {
            widget: 'Checkbox',
            title: 'Checkbox 多项选择框',
        },
        {
            widget: 'AlgoList',
            title: 'AlgoList 属性组合框',
        },
    ],
    map: [
        {
            widget: 'DataMap',
            title: 'DataMap 数据对象',
        },
        {
            widget: 'NestMap',
            title: 'NestMap 嵌套对象',
        },
    ],
    File: [
        {
            widget: 'File',
            title: 'File 文件选择器',
        },
        {
            widget: 'ImageLabelField',
            title: 'ImageLabelField 图片标注',
        },
        // {
        //   widget: 'Input',
        //   title: 'Input 普通输入框',
        // },
    ],
    Dir: [
        {
            widget: 'Dir',
            title: 'Dir 文件夹选择器',
        },
        // {
        //   widget: 'Input',
        //   title: 'Input 普通输入框',
        // },
    ],
};
// 输入框类型
export const typeList = [
    'Input 普通输入框',
    'IpInput 输入框',
    'InputNumber 数值输入框',
    'Slider 滑块输入框',
    'Radio 单项选择框',
    'Select 单项选择框',
    'MultiSelect 多项选择框',
    'Checkbox 多项选择框',
    'Switch 开关选择器',
    'File 文件选择器',
    'Dir 文件夹选择器',
];
// 默认节点大小
export const archSize = {
    width: 140,
    height: 40,
    nodeWidth: 300,
    nodeHeight: 116,
};
/**
 # STARTING：节点正在启动中
 # FATAL：进程无法成功启动
 # RUNNING：节点正常运行中
 # ERROR: 节点运行出现异常
 # STOPPING：进程正在处理用户的停止请求
 # STOPPED：节点已经被用户主动停止，或从未启动过
 # UNKNOWN：未知状态
 # WAITING RESTART: 等待节点自动重启
 * */
export const nodeStatusColor: any = {
    STARTING: '#52c41a',
    RUNNING: '#52c41a', // 'rgba(24, 144, 255, 1)',
    STOPPING: '#52c41a',
    STOPPED: '#30a2a3',
    UNKNOWN: '#ffba00',
    CREATED: '#ff4d4f',
    EXITED: '#ff4d4f',
    FATAL: '#ff4d4f',
    ERROR: '#ff4d4f',
    ERRORED: '#ff4d4f',
    SEARCH: '#52c41a',
    default: '',
};
// 节点通用配置
export const generalConfigList = {
    start_delay_time: {
        name: 'start_delay_time',
        alias: '启动延时(s)',
        require: true,
        default: 0,
        value: 0,
        type: 'float',
        description: '防止后续节点未启动导致的数据积压问题',
        widget: {
            type: 'InputNumber',
            max: 60.0,
            min: 0.0,
            step: 0.01,
            precision: 2,
        },
    },
    input_check: {
        name: 'input_check',
        alias: '输入校验',
        description:
            '当校验输入关闭时，该节点可不等待execute执行参数齐全即可执行，但必须为execute的参数指定默认值，一般为None\n 可代替Gather类型插件使用',
        require: true,
        default: true,
        value: true,
        type: 'bool',
        widget: {
            type: 'Switch',
        },
    },
    output_check: {
        name: 'output_check',
        alias: '输出校验',
        description:
            '当输出校验开启时，会对节点的输出与声明数据做对比，不一致时进行告警',
        require: true,
        default: false,
        value: false,
        type: 'bool',
        widget: {
            type: 'Switch',
        },
    },
    cost_record: {
        name: 'cost_record',
        alias: '记录耗时',
        description: '是否在日志文件中记录节点的处理耗时',
        require: true,
        default: true,
        value: true,
        type: 'bool',
        widget: {
            type: 'Switch',
        },
    },
    show_update_time: {
        name: 'show_update_time',
        alias: '显示运行时间',
        description: '',
        require: true,
        default: true,
        value: true,
        type: 'bool',
        widget: {
            type: 'Switch',
        },
    },
};