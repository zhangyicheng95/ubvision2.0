import React, { useEffect, useState } from 'react';
import {
  Select,
  Form,
  Modal,
  Input,
  message,
  Switch,
  InputNumber,
  Button,
} from 'antd';
import _ from 'lodash-es';
import { formatJson } from '@/utils/utils';
import MonacoEditor from '@/components/MonacoEditor';
import { portTypeObj } from '@/pages/Flow/common/constants';

const { Option } = Select;

interface Props {
  data?: any;
  onOk: any;
  onCancel: any;
}

const EditPortModal: React.FC<Props> = (props) => {
  const { data = {}, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const {
    validateFields,
    resetFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  } = form;

  const [formData, setFormData] = useState({
    codeValue: {
      language: 'json',
      value: '',
    },
  });
  const [direction, setDirection] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorValue, setEditorValue] = useState<any>({
    value: '',
    language: 'json',
  });
  const [portType, setPortType] = useState('');

  useEffect(() => {
    if (Object.keys(data).length) {
      setFieldsValue(data);
      setFormData(data);
      setDirection(data?.direction);
      setPortType(data.type);
    }
  }, [data]);

  const handleOk = () => {
    validateFields()
      .then((values) => {
        const { codeValue, ...rest } = values;
        const params = {
          ...rest,
          ...!!rest.alias ? {} : { alias: rest.name },
          codeValue: formData?.codeValue
        };
        onOk(params);
        onCancel();
      })
      .catch((err) => {
        const { errorFields } = err;
        errorFields?.length &&
          message.error(`${errorFields[0].errors[0]} 是必填项`);
      });
  };

  return (
    <Modal
      className="edit-port-modal"
      open={true}
      title="编辑链接桩"
      width="40vw"
      onOk={handleOk}
      onCancel={onCancel}
      okText="确认"
      maskClosable={false}
    >
      <div className="edit-port-modal-body">
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          // layout={'vertical'}
          scrollToFirstError
        >
          <Form.Item
            name="direction"
            label="链接桩位置"
            rules={[{ required: true, message: '链接桩位置' }]}
          >
            <Select
              placeholder="请输入链接桩位置"
              onChange={(val) => {
                setDirection(val);
              }}
            >
              {portPosition?.map?.((port) => {
                return (
                  <Option key={port.key} value={port.key}>
                    {port.title}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="sort"
            label="优先级"
            tooltip="优先级越高，位置越靠右"
            initialValue={1}
            rules={[{ required: false, message: '优先级' }]}
          >
            <InputNumber placeholder="" />
          </Form.Item>
          <Form.Item
            name="type"
            label="链接桩类型"
            rules={[{ required: true, message: '链接桩类型' }]}
          >
            <Select
              placeholder="请输入链接桩类型"
              disabled={false}
              onChange={(val) => {
                setPortType(val);
              }}
            >
              {Object.keys(portTypeObj)?.map?.((type) => {
                return (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '名称' }]}
          >
            <Input placeholder="请输入名称" disabled={!!data?.name} />
          </Form.Item>
          <Form.Item
            name="alias"
            label="别名"
            rules={[{ required: false, message: '别名' }]}
          >
            <Input placeholder="请输入别名" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            tooltip="插件描述信息"
            rules={[{ required: false, message: '描述' }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 5, maxRows: 10 }}
              placeholder="请输入描述"
              className="scrollbar-style"
            />
          </Form.Item>
          <Form.Item
            name="codeValue"
            label="编码"
            tooltip="自定义编码"
            rules={[{ required: false, message: '编码' }]}
          >
            {!!formData?.codeValue?.value ? (
              <Input.TextArea
                autoSize={{ minRows: 5, maxRows: 10 }}
                value={formData?.codeValue?.value}
                style={{ marginBottom: 8 }}
                disabled
              />
            ) : null}
            <Button
              onClick={() => {
                setEditorValue({
                  value:
                    formData?.codeValue?.language === 'json' &&
                      _.isObject(formData?.codeValue?.value)
                      ? formatJson(formData?.codeValue?.value)
                      : formData?.codeValue?.value,
                  language: formData?.codeValue?.language,
                });
                setEditorVisible(true);
              }}
            >
              编辑
            </Button>
          </Form.Item>
          {direction === 'output' && portType !== 'numpy.ndarray' ? (
            <Form.Item
              name="pushData"
              label="是否推送数据"
              initialValue={false}
              valuePropName="checked"
              rules={[{ required: true, message: '是否必填' }]}
            >
              <Switch />
            </Form.Item>
          ) : null}
          {direction === 'input' ? (
            <Form.Item
              name="require"
              label="必要"
              initialValue={false}
              valuePropName="checked"
              rules={[{ required: true, message: '必要' }]}
            >
              <Switch />
            </Form.Item>
          ) : null}
        </Form>

        {editorVisible ? (
          <MonacoEditor
            defaultValue={
              editorValue.language === 'json' && _.isObject(editorValue.value)
                ? formatJson(editorValue.value)
                : editorValue.value
            }
            language={editorValue.language}
            visible={editorVisible}
            onOk={(val: any) => {
              setFormData((prev: any) => ({ ...prev, codeValue: val }));
              setEditorValue({
                value: '',
                language: 'json',
              });
              setEditorVisible(false);
            }}
            onCancel={() => {
              setEditorValue({
                value: '',
                language: 'json',
              });
              setEditorVisible(false);
            }}
          />
        ) : null}
      </div>
    </Modal>
  );
};

export default EditPortModal;

const portPosition = [
  {
    title: '入度',
    key: 'input',
  },
  {
    title: '出度',
    key: 'output',
  },
];
