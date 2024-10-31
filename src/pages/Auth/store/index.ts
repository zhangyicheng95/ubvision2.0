import { Action, StoreEnum } from './typing';

export const State = {
  searchValue: '' // 列表模糊查询
};

export const init = (state: any) => {
  return state;
};

export const reducer = (state: any, action: Action) => {
  switch (action.type) {
    case StoreEnum.searchValue:
      return { ...state, [StoreEnum.searchValue]: action.value };
    case StoreEnum.buttonDom:
      return { ...state, [StoreEnum.buttonDom]: action.value };
    case StoreEnum.resetData:
      return { ...State };
  }
};
