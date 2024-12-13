import React from 'react';
import { App, Button, Modal } from 'antd';
import ReactDOM from 'react-dom/client';
import App1 from './App';
import './index.less';
import './demos/ipc';
import './global.less';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { persistor, store } from "./redux";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <App>
    <Provider store={store}>
      {
        !!persistor ?
          <PersistGate loading={null} persistor={persistor}>
            <App1 />
          </PersistGate>
          :
          <App1 />
      }
    </Provider>
  </App>
  // </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
