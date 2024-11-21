import { website } from './consts';
import { guid } from '@/utils/utils';
import _ from 'lodash';

let socket: any = null;
const type = 'data';

const listen = (action: any) => {
  if (!socket) {
    try {
      const path = `${website.socket}task-${type}/${website.id}`;
      socket = new WebSocket(path);
      socket.onopen = () => {
        console.log(`${type} ws:open`);
      };
      socket.onmessage = (msg: any) => {
        try {
          const result = JSON.parse(msg.data);
          const { uid = '', data = {}, ...rest } = result;
          if (uid) {
            const newData = (Object.entries(data || {}) || []).reduce((pre: any, cen: any) => {
              /*************监听系统命令及提示框************/
              if (cen[0]?.indexOf('__cmd__') > -1) {
                window?.ipcRenderer?.invoke(`shell-cmd`, cen[1]);
              }
              if (cen[0]?.indexOf('__notification__') > -1) {
                window?.ipcRenderer?.invoke(
                  `system-notification`,
                  _.isString(cen[1]) ? cen[1] : JSON.stringify(cen[1])
                );
              }
              /************监听系统命令及提示框*************/
              const key = cen[0]?.split('@')[0],
                value = _.isBoolean(cen[1])
                  ? cen[1]
                    ? 'RUNNING'
                    : 'STOPPED'
                  : !!cen[1]?.name?.indexOf('.ply') || !!cen[1]?.name?.indexOf('.stl')
                    ? { ...cen[1], guid: guid() }
                    : cen[1];

              if (key == 'uid') {
                return {
                  uid,
                  ...pre,
                };
              }
              return {
                uid,
                ...pre,
                [_.toLower(key)]: value,
                [key]: value,
              };
            }, {});
            action({ [uid]: newData });
          }
        } catch (err) { }
      };
      socket.onclose = function () {
        console.log(`${type} ws:close`);
        socket = undefined;
      };
      socket.onerror = () => reconnect(action);
    } catch (e) {

    }
  }
};

let timeConnect = 0;
function reconnect(action: any) {
  timeConnect++;
  console.log(`第${timeConnect}次重连`);
  // 进行重连
  setTimeout(() => {
    listen(action);
  }, 2000);
}

const close = () => {
  if (socket) {
    socket.onclose();
  }
};

export default { listen, close };
