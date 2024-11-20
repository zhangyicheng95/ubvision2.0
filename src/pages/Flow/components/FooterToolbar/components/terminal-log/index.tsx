import React, { useEffect } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { AttachAddon } from 'xterm-addon-attach';
import axios from 'axios';
import styles from './index.module.less';

const socketURL = 'ws://127.0.0.1:4000/socket/';

interface Props {
  
}

const TerminalLog: React.FC<Props> = (props) => {
  // 初始化当前系统环境，返回终端的 pid，标识当前终端的唯一性
  const initSysEnv = async (term: Terminal) => {
    return axios
      .post('http://127.0.0.1:4000/terminal')
      .then((res) => { return res.data })
      .catch((err) => {
        try {
          throw new Error(err);
        } catch (error) {

        }
      })
  };

  useEffect(() => {
    const term = new Terminal({
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontWeight: 400,
      fontSize: 14,
      rows: 200,
      theme: {
        //   字体
        foreground: '#fff',
        background: '#000',
        // 光标
        cursor: 'help'
        // lineHeight: 18
      }
    });
    // @ts-ignore
    !!document.getElementById('terminal') && term.open(document.getElementById('terminal'));
    term.focus();

    async function asyncInitSysEnv() {
      const pid = await initSysEnv(term);
      const ws = new WebSocket(socketURL + pid);
      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);
    }

    asyncInitSysEnv();
    return () => {
      // 组件卸载，清除 Terminal 实例
      term.dispose();
    };
  }, []);

  return <div className={styles.terminalLog}>
    <div id="terminal" />
  </div>;
};

export default TerminalLog;
