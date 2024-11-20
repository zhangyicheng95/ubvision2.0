import { website } from './consts';

let socket: any = null;
const type = 'state';

const listen = (action: any) => {
  if (!socket) {
    try {
      const path = `${website.socket}task-${type}/${website.id}`;
      socket = new WebSocket(path);
      socket.onopen = () => console.log(`${type} ws:open`);
      socket.onmessage = (msg: any) => {
        try {
          const payload = JSON.parse(msg.data);
          action(payload);
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
