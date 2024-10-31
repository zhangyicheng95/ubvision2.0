import { isNil } from 'lodash';

import { IRep } from './req';

export class IpcResponse implements IRep{
  code: string = "SUCCESS";

  data: any;

  message: string = "success";

  constructor (code:string, data:any, message:string) {
    this.code = code
    this.data = data
    this.message = message
  }

  to_json () {
    return {code:this.code, data:this.data, message:this.message}
  }
}

export class Success extends IpcResponse{
  constructor (data:any=null, message:string="success!", code:string="SUCCESS") {
    const $data = isNil(data) ? {} : data
    super(code, $data, message);
  }
}

export class Failure extends IpcResponse{
  constructor (data:any=null, message:string="failure!", code:string="FAIL_EXCEPTION") {
    const $data = isNil(data) ? {} : data
    super(code, $data, message);
  }
}

export class Unsupported extends IpcResponse{
  constructor (data:any=null, message:string="Unsupported request method!", code:string="UNSUPPORTED_METHOD_EXCEPTION") {
    const $data = isNil(data) ? {} : data
    super(code, $data, message);
  }
}


export class NotFound extends IpcResponse{
  constructor (data:any=null, message:string="data no found!", code:string="NOTFOUND_EXCEPTION") {
    const $data = isNil(data) ? {} : data
    super(code, $data, message);
  }
}

export class Exists extends IpcResponse{
  constructor (data:any=null, message:string="data exists!", code:string="EXISTS_EXCEPTION") {
    const $data = isNil(data) ? {} : data
    super(code, $data, message);
  }
}

export class Unkonwn extends IpcResponse{
  constructor (data:any=null, message:string="unknown!", code:string="UNKNOWN_EXCEPTION") {
    const $data = isNil(data) ? {} : data
    super(code, $data, message);
  }
}
