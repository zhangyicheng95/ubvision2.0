/**
 * store类型系统定义
 */
export enum StoreEnum {
  resetData = 'resetData',  //  重置数据
  searchValue = 'searchValue',
  buttonDom = 'buttonDom', //保存按钮
}

export type Action = {
  type: StoreEnum;
  value?: any
}

/**
 * StoreProps参数
 */
export type Fn = (...args: any) => any;
export type Props = {
  state: any;
  dispatch: Fn;
  [propName: string]: any;
}
