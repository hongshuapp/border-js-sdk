/**
 * Border SDK 配置接口
 */
export interface BorderConfigOptions {
  /** API 地址，默认 https://border-api.hongshuapp.com/openapi/run */
  apiUrl?: string;
  /** 连接超时时间（毫秒），默认 10000 */
  timeout?: number;
}

export class BorderConfig {
  static readonly DEFAULT_API_URL = 'https://border-api.hongshuapp.com/openapi/run';
  static readonly DEFAULT_TIMEOUT = 10000;

  readonly apiUrl: string;
  readonly timeout: number;

  constructor(options: BorderConfigOptions = {}) {
    this.apiUrl = options.apiUrl ?? BorderConfig.DEFAULT_API_URL;
    this.timeout = options.timeout ?? BorderConfig.DEFAULT_TIMEOUT;
  }
}
