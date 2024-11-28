import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  Modal,
  Upload,
  Button,
  message,
} from 'antd';
import Monaco from 'react-monaco-editor';
import * as monaco from 'monaco-editor';

interface Props {
  width?: any;
  height?: any;
  editorValue: any;
  editorLanguage: any;
  onChange?: any;
  readonly?: boolean;
}
let timer: NodeJS.Timeout | null = null;
const Editor: React.FC<Props> = (props) => {
  const {
    width = "100%",
    height = "100%",
    editorValue,
    editorLanguage,
    onChange,
    readonly = false,
  } = props;
  const editorRef = useRef<any>({
    editor: null,
    editorValue: '',
  });

  return (
    <Monaco
      width={width}
      height={height}
      language={editorLanguage}
      theme={localStorage.getItem('theme-mode') === 'dark' ? "vs-dark" : "vs-light"}
      value={editorValue}
      onChange={(value) => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
          editorRef.current.editorValue = value;
          onChange && onChange(value);
        }, 300);
      }}
      options={{
        selectOnLineNumbers: true,
        roundedSelection: false,
        cursorStyle: 'line',
        automaticLayout: true,
        readOnly: readonly,
        formatOnType: true,
        formatOnPaste: true,
      }}
      editorDidMount={(editor: any) => {
        editorRef.current.editor = editor;
        // JSON格式化
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [],
        });
      }}
    />
  );
};

export default Editor;
