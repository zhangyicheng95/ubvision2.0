export interface OpenFileLocationRequestBody {
  path: string;
}

export interface ChooseFolderResponseBody {
  success: boolean;
  directoryPath: string;
}

export interface ChooseFilesResponseBody {
  success: boolean;
  filePaths: Array<string>;
}

export interface SaveFileRequestBody {
  defaultPath?: string;
  data: string | Uint8Array;
}

export interface SaveFileResponseBody {
  success: boolean;
  path: string;
}

export interface FileFilter {
  name: string; // 自定义类型，如Image
  extensions: string[]; // 后缀列表， 如['jpg','png', 'bmp']
}
