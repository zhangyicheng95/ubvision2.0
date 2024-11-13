import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  Modal,
  Upload,
  Button,
  message,
} from 'antd';
import Monaco from 'react-monaco-editor';
import { CloudDownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { downFileFun } from '@/utils/utils';
import Editor from './editor';

const { Option } = Select;
interface Props {
  defaultValue?: any;
  language?: any;
  visible: any;
  onOk: any;
  onCancel: any;
  readonly?: boolean;
}
let timer: NodeJS.Timeout | null = null;
const MonacoEditor: React.FC<Props> = (props) => {
  const {
    defaultValue = '',
    language = 'json',
    visible,
    onOk,
    onCancel,
    readonly,
  } = props;
  const editorRef = useRef<any>({
    editor: null,
    editorValue: '',
  });
  const [editorValue, setEditorValue] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('');

  useEffect(() => {
    setEditorValue(defaultValue);
  }, [defaultValue]);
  useEffect(() => {
    setEditorLanguage(language);
  }, [language]);
  // 导入项目
  const uploadProps = {
    accept: '.json',
    showUploadList: false,
    multiple: true,
    beforeUpload(file: any) {
      const reader = new FileReader(); // 创建文件对象
      reader.readAsText(file); // 读取文件的内容/URL
      reader.onload = (res: any) => {
        const {
          target: { result },
        } = res;
        try {
          setEditorLanguage('json');
          setEditorValue(result);
        } catch (err) {
          message.error('json文件格式错误，请修改后上传。');
          console.error(err);
        }
      };
      return false;
    },
  };

  return (
    <Modal
      title={
        <div className="flex-box">
          编辑器
          <Select
            style={{ width: 200, margin: '0 24px' }}
            onChange={(val) => {
              return setEditorLanguage(val);
            }}
            value={editorLanguage}
          >
            <Option value="javascript">javascript</Option>
            {/* <Option value="typescript">typescript</Option>
            <Option value="scss">scss</Option>
            <Option value="html">html</Option> */}
            <Option value="python">python</Option>
            <Option value="json">json</Option>
            <Option value="sql">sql</Option>
            {/* <Option value="redis">redis</Option>
            <Option value="shell">shell</Option>
            <Option value="java">java</Option> */}
          </Select>
          {
            editorLanguage === 'json' ?
              <div className="flex-box" style={{ gap: 8 }}>
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                  // type="primary"
                  >
                    导入本地json
                  </Button>
                </Upload>
                <Button
                  icon={<CloudDownloadOutlined />}
                  onClick={() => {
                    downFileFun(editorValue, `json编辑器.json`);
                  }}
                >
                  导出json文件
                </Button>
              </div>
              : null
          }
        </div>
      }
      width="calc(100vw - 48px)"
      wrapClassName="monaco-editor-modal"
      centered
      open={visible}
      onOk={() => {
        try {
          if (!!editorValue && editorLanguage === 'json') {
            JSON.parse(editorValue);
          }
        } catch (e) {
          message.error('格式错误');
          return;
        }
        onOk({
          value: editorValue,
          language: editorLanguage,
        });
        // setEditorValue(editorRef.current.editorValue);
      }}
      onCancel={() => {
        onCancel();
      }}
    >
      <Editor
        height={"calc(100vh - 180px)"}
        editorValue={editorValue}
        editorLanguage={editorLanguage}
        onChange={setEditorValue}
        readonly={false}
      />
    </Modal>
  );
};

export default MonacoEditor;
