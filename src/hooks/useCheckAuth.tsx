import { useEffect, useState } from 'react';

/**
 * 判断是否长时间未操作 重新reload当前页面  释放内存
 */
let intervalId: any = null;
export type OperateConfig = { wait?: number, interval?: number }
export const hasOperate = (callback: () => void, config?: OperateConfig) => { //second是检测未操作的时间，秒为单位，callback是该时间段未点击需要执行的函数
  const { wait, interval } = Object.assign({ wait: 1000 * 60, interval: 1000 * 60 }, config)
  const maxTime = wait; // 此处设置倒计时时间，单位为秒
  let time = maxTime;
  !!intervalId && clearInterval(intervalId);
  intervalId = setInterval(function () {
    time = time - interval;
    if (time <= 0) {
      // clearInterval(intervalId);
      time = maxTime;
      callback();
    }
  }, interval);
};

export const useCheckAuth = (config?: OperateConfig, callback?: () => void) => {
  const [state, setState] = useState(null);
  useEffect(() => {
    hasOperate(() => {
      if (!!callback) {
        callback();
      } else {
        window.location.reload();
      }
    }, config);
  }, []);
  return state;
};
