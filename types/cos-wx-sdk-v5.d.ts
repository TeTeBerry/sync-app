declare module 'cos-wx-sdk-v5' {
  export type CosAuthorizationResult = {
    TmpSecretId: string;
    TmpSecretKey: string;
    SecurityToken: string;
    StartTime?: number;
    ExpiredTime: number;
    ScopeLimit?: boolean;
    Error?: unknown;
  };

  export type CosGetAuthorizationOptions = {
    Bucket: string;
    Region: string;
    Method?: string;
    Key?: string;
    Pathname?: string;
  };

  export type CosUploadFileParams = {
    Bucket: string;
    Region: string;
    Key: string;
    FilePath: string;
    SliceSize?: number;
    onProgress?: (progressData: unknown) => void;
    onTaskReady?: (taskId: string) => void;
  };

  export type CosUploadFileResult = {
    Location?: string;
    statusCode?: number;
    ETag?: string;
  };

  export type CosOptions = {
    SimpleUploadMethod?: 'putObject' | 'postObject';
    getAuthorization?: (
      options: CosGetAuthorizationOptions,
      callback: (data: CosAuthorizationResult) => void,
    ) => void;
  };

  export default class COS {
    constructor(options?: CosOptions);
    uploadFile(
      params: CosUploadFileParams,
      callback: (err: unknown, data: CosUploadFileResult) => void,
    ): void;
  }
}
