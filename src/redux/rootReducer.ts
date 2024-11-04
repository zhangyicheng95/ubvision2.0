import { IRootActions, rootActionTypes } from "./actions";

const initalState: IRootActions = {
	token: "",
	loading: false,
	getProjectListFun: () => null,
	loopProjectStatusFun: () => null,
	projectList: [],
	selectedRows: [],
};

const rootReducer = (state = initalState, actions: IRootActions) => {
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
		case rootActionTypes.CLEAR_ALL_DATA:
			return initalState;
		default:
			return state;
	}
};

export default rootReducer;
