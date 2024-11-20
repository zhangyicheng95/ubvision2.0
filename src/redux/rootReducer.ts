import { IRootActions, rootActionTypes } from "./actions";
import * as _ from 'lodash-es';

const initalState: IRootActions = {
	token: "",
	loading: false,
	getProjectListFun: () => null,
	loopProjectStatusFun: () => null,
	projectList: [],
	selectedRows: [],
	graphData: null,
	canvasPlugins: [],
	canvasDirPlugins: [],
	canvasData: {
		id: '',
		alias: '默认方案',
		name: '默认方案',
		description: '',
		plugin_dir: '',
		pushData: false,
		zoom: 1,
		flowData: {
			edges: [],
			nodes: [],
			groups: []
		},
		graphLock: false, // 画布锁
	},
	canvasDataBase: {
		id: '',
		alias: '',
		name: '',
		description: '',
		plugin_dir: '',
		pushData: false,
		zoom: 1,
		flowData: {
			edges: [],
			nodes: [],
			groups: []
		},
		graphLock: false, // 画布锁
	},
	canvasStart: false,
	selectedNode: '',
	saveGraph: (param?: any) => null,
	getCanvasPlugins: () => null, // 获取侧边插件列表
	logList: [], // 日志列表
	errorList: [], // 告警列表
	flowRunningData: {}, // 流程运行数据
};

const rootReducer = (state = initalState, actions: any) => {
	switch (actions.type) {
		// token
		case rootActionTypes.SET_TOKEN:
			return {
				...state,
				token: actions.token!,
			};
		//loading
		case rootActionTypes.SET_LOADING:
			return {
				...state,
				loading: actions.loading,
			};
		// 获取方案列表
		case rootActionTypes.GET_PROJECT_LIST:
			return {
				...state,
				getProjectListFun: actions.getProjectListFun,
			};
		// 循环方案启动状态
		case rootActionTypes.LOOP_PROJECT_STATUS:
			return {
				...state,
				loopProjectStatusFun: actions.loopProjectStatusFun,
			};
		// 设置方案列表
		case rootActionTypes.SET_PROJECT_LIST:
			return {
				...state,
				projectList: actions.projectList,
			};
		// 设置列表多选项
		case rootActionTypes.SET_SELECTED_ROWS:
			return {
				...state,
				selectedRows: actions.selectedRows,
			};
		// 设置画布
		case rootActionTypes.SET_GRAPH_DATA:
			return {
				...state,
				graphData: actions.graphData,
			};
		// 设置画布左侧插件列表
		case rootActionTypes.SET_CANVAS_PLUGINS:
			return {
				...state,
				canvasPlugins: actions.canvasPlugins,
			};
		// 设置画布内置插件列表
		case rootActionTypes.SET_CANVAS_DIR_PLUGINS:
			return {
				...state,
				canvasDirPlugins: actions.canvasDirPlugins,
			};
		// 设置方案数据
		case rootActionTypes.SET_CANVAS_DATA:
			return {
				...state,
				canvasData: actions.canvasData,
			};
		// 设置方案数据-备份
		case rootActionTypes.SET_CANVAS_DATA_BASE:
			return {
				...state,
				canvasDataBase: actions.canvasDataBase,
			};
		// 方案启动
		case rootActionTypes.SET_CANVAS_START:
			return {
				...state,
				canvasStart: actions.canvasStart,
			};
		// 点击选中节点
		case rootActionTypes.SET_SELECTED_NODE:
			return {
				...state,
				selectedNode: actions.selectedNode,
			};
		// 方案保存函数
		case rootActionTypes.SET_SAVE_GRAPH:
			return {
				...state,
				saveGraph: actions.saveGraph,
			};
		// 流程图-获取插件列表
		case rootActionTypes.SET_GET_CANVAS_PLUGINS:
			return {
				...state,
				getCanvasPlugins: actions.getCanvasPlugins,
			};
		// 流程图-日志列表
		case rootActionTypes.SET_LOG_LIST:
			return {
				...state,
				logList: (!actions.logList || (_.isArray(actions.logList) && actions.logList?.length === 0))
					? [] :
					state.logList?.concat?.(actions.logList)?.slice(-50),
			};
		// 流程图-告警列表
		case rootActionTypes.SET_ERROR_LIST:
			return {
				...state,
				errorList: (!actions.errorList || (_.isArray(actions.errorList) && actions.errorList?.length === 0))
					? [] :
					state.errorList?.concat?.(actions.errorList)?.slice(-50),
			};
		// 流程图-运行数据
		case rootActionTypes.SET_FLOW_RUNNING_DATA:
			return {
				...state,
				flowRunningData: !actions.flowRunningData ? {} : {
					...state.flowRunningData,
					...actions.flowRunningData
				},
			};
		// 清理所有数据
		case rootActionTypes.CLEAR_ALL_DATA:
			return initalState;
		default:
			return state;
	}
};

export default rootReducer;
