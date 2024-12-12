export interface ProjectInfo {
	isUnderAge?: boolean;
	/**
	 * 用户角色 1 普通用户 2白名单用户
	 */
	userRole?: number;
	withDrawBalance: number;
	withdrawal_limit_amount: number;
}

export enum rootActionTypes {
	"SET_TOKEN" = "SET_TOKEN",
	"SET_LOADING" = "SET_LOADING",
	"GET_PROJECT_LIST" = "GET_PROJECT_LIST",
	"LOOP_PROJECT_STATUS" = "LOOP_PROJECT_STATUS",
	"SET_PROJECT_LIST" = "SET_PROJECT_LIST",
	"SET_SELECTED_ROWS" = "SET_SELECTED_ROWS",
	"SET_GRAPH_DATA" = "SET_GRAPH_DATA",
	"SET_CANVAS_PLUGINS" = "SET_CANVAS_PLUGINS",
	"SET_CANVAS_DIR_PLUGINS" = "SET_CANVAS_DIR_PLUGINS",
	"SET_CANVAS_DATA" = "SET_CANVAS_DATA",
	"SET_CANVAS_DATA_BASE" = "SET_CANVAS_DATA_BASE",
	"SET_CANVAS_START" = "SET_CANVAS_START",
	"SET_SELECTED_NODE" = "SET_SELECTED_NODE",
	"SET_SAVE_GRAPH" = "SET_SAVE_GRAPH",
	"SET_GET_CANVAS_PLUGINS" = "SET_GET_CANVAS_PLUGINS",
	"SET_LOG_LIST" = "SET_LOG_LIST",
	"SET_ERROR_LIST" = "SET_ERROR_LIST",
	"SET_FLOW_RUNNING_DATA" = "SET_FLOW_RUNNING_DATA",
	"SET_FLOW_RUNNING_DATA_HISTORY" = "SET_FLOW_RUNNING_DATA_HISTORY",
	"SET_FLOW_RUNNING_STATUS" = "SET_FLOW_RUNNING_STATUS",
	"SET_PLUGIN_LIST" = "SET_PLUGIN_LIST",
	"CLEAR_FLOW_DATA" = "CLEAR_FLOW_DATA",
}

export interface IRootActions {
	type?: keyof rootActionTypes;
	token: string;
	loading: boolean;
	// 列表相关
	getProjectListFun: () => null,
	loopProjectStatusFun: (list: []) => null,
	projectList: [];
	selectedRows: [];
	// 流程图画布相关
	graphData: any, // 画布实例
	canvasPlugins: []; // 左侧插件列表
	canvasDirPlugins: []; // 内置插件列表
	canvasData: {
		id: '',
		alias: '默认方案',
		name: '默认方案',
		description: '',
		plugin_dir: '',
		pushData: boolean,
		zoom: 1,
		flowData: {
			edges: [],
			nodes: [],
			groups: []
		},
		graphLock: boolean, // 画布锁
		lineType: '', // 连线类型
		contentData: {
			windowsScale: 1,
			content: [],
			showHeader: false,
			showFooter: false,
			background: string,
		}, // 前端布局
	}; // 画布数据
	canvasDataBase: {
		id: '',
		alias: '',
		name: '',
		description: '',
		plugin_dir: '',
		pushData: boolean,
		zoom: 1,
		flowData: {
			edges: [],
			nodes: [],
			groups: []
		},
		graphLock: boolean, // 画布锁
		lineType: '', // 连线类型
		contentData: {
			windowsScale: 1,
			content: [],
			showHeader: false,
			showFooter: false,
			background: string,
		}, // 前端布局
	}; // 画布数据备份
	canvasStart: false; // 方案启动
	selectedNode: string, // 双击选中节点
	saveGraph: (param?: any) => null, // 方案保存函数
	getCanvasPlugins: () => null, // 获取侧边插件列表
	logList: string[], // 日志列表
	errorList: string[], // 告警列表
	flowRunningData: any, // 流程运行数据
	flowRunningDataHistory: any, // 流程运行数据-历史数据
	flowRunningStatus: {}, // 流程运行状态
	pluginList: [], // 插件管理列表
}

// 缓存用户token
export const setTokenAction = (token: string) => {
	return {
		type: rootActionTypes.SET_TOKEN,
		token,
	};
};
// loading
export const setLoadingAction = (loading: boolean) => {
	return {
		type: rootActionTypes.SET_LOADING,
		loading
	}
};
// 拉取方案列表函数
export const getProjectListAction = (getProjectListFun: any) => {
	return {
		type: rootActionTypes.GET_PROJECT_LIST,
		getProjectListFun,
	};
};
// 循环获取任务状态
export const loopProjectStatusAction = (loopProjectStatusFun: any) => {
	return {
		type: rootActionTypes.LOOP_PROJECT_STATUS,
		loopProjectStatusFun,
	};
};
// 设置方案列表
export const setProjectListAction = (projectList: []) => {
	return {
		type: rootActionTypes.SET_PROJECT_LIST,
		projectList,
	};
};
// 列表多选
export const setSelectedRowsAction = (selectedRows: []) => {
	return {
		type: rootActionTypes.SET_PROJECT_LIST,
		selectedRows,
	};
};
// 流程图-初始化画布
export const setGraphDataAction = (graphData: object) => {
	return {
		type: rootActionTypes.SET_GRAPH_DATA,
		graphData
	};
};
// 流程图-左侧插件列表
export const setCanvasPluginsAction = (canvasPlugins: []) => {
	return {
		type: rootActionTypes.SET_CANVAS_PLUGINS,
		canvasPlugins
	};
};
// 流程图-内置插件列表
export const setCanvasDirPluginsAction = (canvasDirPlugins: object[]) => {
	return {
		type: rootActionTypes.SET_CANVAS_DIR_PLUGINS,
		canvasDirPlugins
	};
};
// 流程图-方案信息
export const setCanvasDataAction = (canvasData: object) => {
	return {
		type: rootActionTypes.SET_CANVAS_DATA,
		canvasData
	};
};
// 流程图-方案信息-备份
export const setCanvasDataActionBaseAction = (canvasDataBase: object) => {
	return {
		type: rootActionTypes.SET_CANVAS_DATA_BASE,
		canvasDataBase
	};
};
// 流程图-启动信息
export const setCanvasStartAction = (canvasStart: boolean) => {
	return {
		type: rootActionTypes.SET_CANVAS_START,
		canvasStart
	};
};
// 流程图-点击选中节点
export const setSelectedNodeAction = (selectedNode: string) => {
	return {
		type: rootActionTypes.SET_SELECTED_NODE,
		selectedNode
	}
};
// 流程图-保存方案信息
export const setSaveGraphAction = (saveGraph: any) => {
	return {
		type: rootActionTypes.SET_SAVE_GRAPH,
		saveGraph
	}
};
// 流程图-获取插件列表函数
export const setGetCanvasPluginsAction = (getCanvasPlugins: any) => {
	return {
		type: rootActionTypes.SET_GET_CANVAS_PLUGINS,
		getCanvasPlugins
	};
};
// 流程图-日志列表
export const setLogListAction = (logList: any) => {
	return {
		type: rootActionTypes.SET_LOG_LIST,
		logList
	};
};
// 流程图-告警列表
export const setErrorListAction = (errorList: any) => {
	return {
		type: rootActionTypes.SET_ERROR_LIST,
		errorList
	};
};
// 流程图-运行数据
export const setFlowRunningDataAction = (flowRunningData: any) => {
	return {
		type: rootActionTypes.SET_FLOW_RUNNING_DATA,
		flowRunningData
	};
};
// 流程图-运行数据-历史数据
export const setFlowRunningDataHistoryAction = (flowRunningDataHistory: object) => {
	return {
		type: rootActionTypes.SET_FLOW_RUNNING_DATA_HISTORY,
		flowRunningDataHistory
	};
};
// 流程图-节点状态
export const setFlowRunningStatusAction = (flowRunningStatus: object) => {
	return {
		type: rootActionTypes.SET_FLOW_RUNNING_STATUS,
		flowRunningStatus
	};
};
// 重置流程画布所有的init
export const clearFlowDataAction = () => {
	return {
		type: rootActionTypes.CLEAR_FLOW_DATA,
	};
};
// 插件管理-列表
export const setPluginListAction = (pluginList: []) => {
	return {
		type: rootActionTypes.SET_PLUGIN_LIST,
		pluginList
	};
};
// 界面编辑器-