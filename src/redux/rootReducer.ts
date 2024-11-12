import { IRootActions, rootActionTypes } from "./actions";

const initalState: IRootActions = {
	token: "",
	loading: false,
	getProjectListFun: () => null,
	loopProjectStatusFun: () => null,
	projectList: [],
	selectedRows: [],
	canvasPlugins: [],
	canvasData: {
		id: '',
		name: '',
		plugin_dir: '',
		flowData: {
			edges: [],
			nodes: [],
			groups: []
		}
	},
	canvasStart: false,
};

const rootReducer = (state = initalState, actions: any) => {
	switch (actions.type) {
		case rootActionTypes.SET_TOKEN:
			return {
				...state,
				token: actions.token!,
			};
		case rootActionTypes.SET_LOADING:
			return {
				...state,
				loading: actions.loading,
			};
		case rootActionTypes.GET_PROJECT_LIST:
			return {
				...state,
				getProjectListFun: actions.getProjectListFun,
			};
		case rootActionTypes.LOOP_PROJECT_STATUS:
			return {
				...state,
				loopProjectStatusFun: actions.loopProjectStatusFun,
			};
		case rootActionTypes.SET_PROJECT_LIST:
			return {
				...state,
				projectList: actions.projectList,
			};
		case rootActionTypes.SET_SELECTED_ROWS:
			return {
				...state,
				selectedRows: actions.selectedRows,
			};
		case rootActionTypes.SET_CANVAS_PLUGINS:
			return {
				...state,
				canvasPlugins: actions.canvasPlugins,
			};
		case rootActionTypes.SET_CANVAS_DATA:
			return {
				...state,
				canvasData: actions.canvasData,
			};
		case rootActionTypes.SET_CANVAS_START:
			return {
				...state,
				canvasStart: actions.canvasStart,
			};
		case rootActionTypes.CLEAR_ALL_DATA:
			return initalState;
		default:
			return state;
	}
};

export default rootReducer;
