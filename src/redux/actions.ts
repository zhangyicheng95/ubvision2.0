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
	"SET_CANVAS_PLUGINS" = "SET_CANVAS_PLUGINS",
	"SET_CANVAS_DATA" = "SET_CANVAS_DATA",
	"SET_CANVAS_START" = "SET_CANVAS_START",
	"CLEAR_ALL_DATA" = "CLEAR_ALL_DATA",
}

export interface IRootActions {
	type?: keyof rootActionTypes;
	token: string;
	loading: boolean;
	getProjectListFun: () => null,
	loopProjectStatusFun: (list: []) => null,
	projectList: [];
	selectedRows: [];
	canvasPlugins: [];
	canvasData: {
		id: '',
		name: '',
		plugin_dir: '',
		flowData: {
			edges: [],
			nodes: [],
			groups: []
		}
	};
	canvasStart: false;
}

// 缓存用户token
export const setToken = (token: string) => {
	return {
		type: rootActionTypes.SET_TOKEN,
		token,
	};
};
// loading
export const setLoading = (loading: boolean) => {
	return {
		type: rootActionTypes.SET_LOADING,
		loading
	}
};
// 拉取方案列表函数
export const getProjectList = (getProjectListFun: any) => {
	return {
		type: rootActionTypes.GET_PROJECT_LIST,
		getProjectListFun,
	};
};
// 循环获取任务状态
export const loopProjectStatus = (loopProjectStatusFun: any) => {
	return {
		type: rootActionTypes.LOOP_PROJECT_STATUS,
		loopProjectStatusFun,
	};
};
// 设置方案列表
export const setProjectList = (projectList: []) => {
	return {
		type: rootActionTypes.SET_PROJECT_LIST,
		projectList,
	};
};
// 列表多选
export const setSelectedRows = (selectedRows: []) => {
	return {
		type: rootActionTypes.SET_PROJECT_LIST,
		selectedRows,
	};
};
// 流程图-左侧插件列表
export const setCanvasPlugins = (canvasPlugins: []) => {
	return {
		type: rootActionTypes.SET_CANVAS_PLUGINS,
		canvasPlugins
	};
};
// 流程图-方案信息
export const setCanvasData = (canvasData: {}) => {
	return {
		type: rootActionTypes.SET_CANVAS_DATA,
		canvasData
	};
};
// 流程图-启动信息
export const setCanvasStart = (canvasStart: {}) => {
	return {
		type: rootActionTypes.SET_CANVAS_START,
		canvasStart
	};
};
// 重置所有的init
export const clearAllData = () => {
	return {
		type: rootActionTypes.CLEAR_ALL_DATA,
	};
};
