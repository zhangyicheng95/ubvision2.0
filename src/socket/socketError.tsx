import { website } from './consts';
import _ from 'lodash';
import { openNotificationWithIcon } from '@/pages/Flow/utils';
import { guid } from '@/utils/utils';

let socket: any = null;
const type = 'error';

const listen = (action: any, api: any, ip?: string, id?: string) => {
  if (!socket) {
    try {
      const path = `${ip || website.socket}task-${type}/${id || website.id}`;
      socket = new WebSocket(path);
      socket.onopen = () => {
        console.log(`${type} ws:open`);
      };
      // socket.onmessage = throttleAndMerge;
      socket.onmessage = (msg: any) => {
        try {
          const result = JSON.parse(msg.data);
          const currentData = {
            time: new Date().getTime(),
            ...result,
            level: _.toLower(result.level),
            message: _.isArray(result?.message) ? result.message.join(',') : result.message,
          };
          openNotificationWithIcon(
            api,
            {
              key: guid(),
              type: result?.level,
              title:
                result?.level === 'ERROR'
                  ? '错误'
                  : result?.level === 'CRITICAL'
                    ? '阻断挂起'
                    : '告警',
              content: (
                <div>
                  <p style={{ marginBottom: 8 }}>
                    错误节点：
                    {`${result?.node_name || ''}（${result?.nid || ''}）`}
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    错误信息：{result?.message || ''}
                  </p>
                </div>
              ),
            }
          );
          action?.(currentData);
        } catch (err) {
          // console.log(err);
        }
      };
      socket.onclose = function () {
        console.log(`${type} ws:close`);
        socket = undefined;
      };
      socket.onerror = () => reconnect(action, api, ip, id);
    } catch (e) {
    }
  }
};

let timeConnect = 0;
function reconnect(action: any, api: any, ip?: string, id?: string) {
  timeConnect++;
  console.log(`第${timeConnect}次重连`);
  // 进行重连
  setTimeout(() => {
    listen(action, api, ip, id);
  }, 2000);
}

const close = () => {
  if (socket) {
    socket.onclose();
  }
};

export default { listen, close };
