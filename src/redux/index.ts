import { createStore, compose, applyMiddleware } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import rootReducer from "./rootReducer";

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
	: compose; // redux调试工具

const persistConfig = {
	key: "root",
	storage,
	// blackList: ["projectList"],
};

// @ts-ignore
const persistedReducer = persistReducer(persistConfig, rootReducer);
// @ts-ignore
let store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)));

// @ts-ignore
let persistor: any = null; //persistStore(store); // 是否开启持久化存储

export { store, persistor };
