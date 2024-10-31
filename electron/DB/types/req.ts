export type Method =
  | "get"
  | "GET"
  | "delete"
  | "Delete"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH";

export interface IReq {
  url: string
  method: Method
  headers?:any
  data?: any
  params?: any
}

export interface IRep<T=any> {
  message?:string;
  data:T;
  code: string;
}
