import { fetchGet, fetchPost, fetchPut, fetchDelete } from '@renderer/utils/fetch';

const V1 = '';
// 获取本地全部插件列表
export const getDirPluginList = () => {
  return fetchGet(`${V1}/plugin_info_list`);
  return new Promise((resolve, reject) => {
    resolve({
      "code": "SUCCESS",
      "msg": "",
      "data": [
        {
          "name": "ImageDetector",
          "alias": "图片探测器",
          "version": "1.0.2",
          "category": "Callback",
          "description": "ImageDetector探测指定路径下的新增图片，并读取为ndarray输出\n 本插件当前版本1.0.2可能会阻塞流程运行，请不要放置在组内",
          "author": "liwen",
          "config": {
            "module": "A__ImageDetector",
            "executor": "Plugin",
            "initParams": {
              "path": {
                "name": "path",
                "alias": "探测路径",
                "require": true,
                "type": "Dir",
                "description": "探测指定路径下的新增图片",
                "widget": {
                  "type": "Dir"
                }
              },
              "delay_time": {
                "name": "delay_time",
                "alias": "delay_time(s)",
                "require": true,
                "type": "float",
                "description": "delay_time",
                "widget": {
                  "type": "InputNumber",
                  "max": 10.0,
                  "min": 0.0,
                  "step": 0.01,
                  "precision": 2
                }
              },
              "suffix_list": {
                "name": "suffix_list",
                "alias": "suffix_list",
                "require": false,
                "default": [
                  ".bmp",
                  ".jpg",
                  ".jpeg",
                  ".png"
                ],
                "value": [
                  ".jpg",
                  ".jpeg",
                  ".png",
                  ".bmp"
                ],
                "type": "List[string]",
                "description": "图片文件按后缀筛选",
                "widget": {
                  "type": "Checkbox",
                  "options": [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".bmp"
                  ]
                }
              }
            },
            "input": {},
            "output": {
              "frame": {
                "type": "numpy.ndarray",
                "alias": "图像数据"
              },
              "stem": {
                "type": "string",
                "alias": "图片名"
              },
              "filepath": {
                "type": "string",
                "alias": "文件路径"
              }
            }
          },
          "buildIn": true,
          "useGpu": false
        },
        {
          "name": "ImageStorge",
          "alias": "图片存储器ImgStorge V2",
          "version": "2.0.0",
          "category": "Data",
          "description": "图片存储器",
          "author": "liwen",
          "config": {
            "module": "A__ImageStorge",
            "executor": "Plugin",
            "initParams": {
              "store_dir": {
                "name": "store_dir",
                "alias": "图片存储目录",
                "require": true,
                "default": null,
                "value": null,
                "type": "Dir",
                "description": "选择一个存图目录",
                "widget": {
                  "type": "Dir"
                }
              },
              "target_format": {
                "name": "target_format",
                "alias": "图片存储格式",
                "require": true,
                "default": "jpg",
                "value": [
                  "jpg"
                ],
                "type": "List[string]",
                "widget": {
                  "type": "Radio",
                  "options": [
                    "jpg",
                    "png",
                    "bmp"
                  ]
                }
              },
              "is_save": {
                "name": "is_save",
                "alias": "是否保存图片",
                "require": true,
                "default": true,
                "type": "bool",
                "widget": {
                  "type": "Switch"
                }
              },
              "date_split": {
                "name": "date_split",
                "alias": "按日期分割",
                "require": false,
                "type": "bool",
                "widget": {
                  "type": "Switch"
                }
              },
              "expire_time": {
                "name": "expire_time",
                "alias": "数据存储周期",
                "require": true,
                "default": 15,
                "value": 15,
                "type": "float",
                "widget": {
                  "type": "Slider",
                  "max": 360,
                  "min": 0,
                  "step": 1
                }
              },
              "filename_tag": {
                "name": "filename_tag",
                "alias": "文件名标签",
                "require": true,
                "type": "string",
                "default": "img",
                "value": "img",
                "description": "该tag会成为存储图像文件名的一部分",
                "widget": {
                  "type": "Input"
                }
              },
              "output_delay_time": {
                "name": "output_delay_time",
                "alias": "输出延时(s)",
                "require": true,
                "default": 0.0,
                "value": 0.0,
                "type": "float",
                "description": "[高级特性]避免图片未完成存储时提前返回",
                "widget": {
                  "type": "InputNumber",
                  "max": 3.0,
                  "min": 0.0,
                  "step": 0.1,
                  "precision": 1
                }
              }
            },
            "input": {
              "src_img": {
                "type": "numpy.ndarray",
                "require": true,
                "alias": "原图"
              },
              "parents": {
                "type": "string",
                "require": false,
                "alias": "父路径"
              },
              "img_name": {
                "type": "string",
                "require": false,
                "alias": "图片文件名"
              },
              "is_save": {
                "type": "bool",
                "require": true,
                "alias": "是否存储"
              }
            },
            "output": {
              "status": {
                "type": "bool",
                "alias": "文件存储状态"
              },
              "filepath": {
                "type": "string",
                "alias": "图片路径"
              }
            },
            "group": []
          }
        },
        {
          "name": "TcpServer",
          "alias": "TCP服务",
          "version": "1.0.0",
          "category": "SERV",
          "description": "TCP服务插件，跟监听指定端口的请求，并根据\"默认异常响应信息\"和 \"异常中断响应表\" 进行响应",
          "author": "liwen",
          "config": {
            "module": "A__TcpServer",
            "executor": "Plugin",
            "initParams": {
              "port": {
                "name": "port",
                "alias": "port",
                "require": true,
                "default": 2000,
                "value": 2000,
                "type": "int",
                "description": "监听端口",
                "widget": {
                  "type": "InputNumber",
                  "max": 65535,
                  "min": 1000,
                  "step": 1,
                  "precision": 0
                }
              },
              "default_res_msg": {
                "name": "default_res_msg",
                "alias": "默认异常响应信息",
                "require": true,
                "default": "ERROR",
                "value": "ERROR",
                "type": "string",
                "description": "默认异常响应信息",
                "widget": {
                  "type": "Input"
                }
              },
              "response_template": {
                "name": "response_template",
                "alias": "异常中断响应表",
                "require": false,
                "default": "{}",
                "type": "string",
                "widget": {
                  "type": "codeEditor"
                }
              },
              "auto_close": {
                "name": "auto_close",
                "alias": "是否自动主动断开链接",
                "require": true,
                "default": false,
                "value": false,
                "type": "bool",
                "description": "在消息响应结束时自动主动断开链接",
                "widget": {
                  "type": "Switch"
                }
              }
            },
            "input": {},
            "output": {
              "message": {
                "type": "string",
                "alias": "请求数据"
              }
            }
          },
          "buildIn": true,
          "useGpu": false
        }
      ]
    });
  });
};
// 获取已载入的插件列表
export const getPluginList = () => {
  return fetchGet(`${V1}/plugins`);
};

// 根据id新增插件
export async function addPlugin(params: any) {
  return fetchPost(`${V1}plugin`, { body: params });
}

// 根据id获取插件
export async function getPlugin(id: string) {
  return fetchGet(`${V1}plugin/${id}`);
}

// 根据id修改插件
export async function updatePlugin(id: string, params: any) {
  return fetchPut(`${V1}plugin/${id}`, { body: params });
}

// 根据id删除插件
export async function deletePlugin(id: string) {
  return fetchDelete(`${V1}plugin/${id}`);
}
