import { IRootActions, rootActionTypes } from "./actions";

const initalState: IRootActions = {
	token: "",
	loading: false,
	getProjectListFun: () => null,
	loopProjectStatusFun: () => null,
	projectList: [],
	selectedRows: [],
	graphData: null,
	canvasPlugins: [],
	canvasData: {
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
		}
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
		}
	},
	canvasStart: false,
	selectedNode: '',
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
		// 清理所有数据
		case rootActionTypes.CLEAR_ALL_DATA:
			return initalState;
		default:
			return state;
	}
};

export default rootReducer;
