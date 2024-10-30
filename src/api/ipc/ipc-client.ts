import { message, notification } from 'antd';

const { ipcRenderer } = window || {};

/**
 * ipcClientLoading
 * @param showLoading
 * @param args
 * @returns
 */
async function ipcClientLoading(showLoading: boolean, ...args: Array<any>): Promise<any> {
  const hide = showLoading ? () => {
  } : message.loading('in progress..', 0);

  let result;
  try {
    const [event, ...eventArgs] = args;
    result = await ipcRenderer?.invoke(event, ...eventArgs);
  } catch (err: any) {
    const msg = err.message.split(':').pop().trim();
    notification.error(msg);
    throw Error(err);
  } finally {
    if (showLoading) {
      hide();
    }
  }
  return result;
}

const ipcClient = {
  asyncReq: async (...args: Array<any>): Promise<any> => {
    return ipcClientLoading(true, ...args);
  },
  on: (event: string, callback: any): any => {
    return ipcRenderer.on(event, callback);
  }
};

export default ipcClient;
