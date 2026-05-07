import https from 'https';
import http from 'http';
import { URL } from 'url';
import { BorderConfig } from './config';
import { SubmitRequest, SubmitResponse } from './types';
import { BorderApiException } from './exception';

/**
 * Border 内容审核平台 Node.js SDK 客户端
 * 
 * 使用方式：
 * 
 * 方式一：简单方法调用
 * ```typescript
 * const client = new BorderClient('your-team-token');
 * const response = await client.submit(1970702619188862988, '待审核文本');
 * ```
 * 
 * 方式二：Builder 模式
 * ```typescript
 * const client = BorderClient.builder()
 *   .teamToken('your-team-token')
 *   .timeout(10000)
 *   .build();
 * 
 * const response = await client.submit({
 *   pipelineId: 1970702619188862988,
 *   teamToken: 'your-team-token',
 *   content: '待审核文本',
 *   env: { userId: '12345' }
 * });
 * ```
 */
export class BorderClient {
  private readonly teamToken: string;
  private readonly config: BorderConfig;

  constructor(teamToken: string, config?: BorderConfig) {
    if (!teamToken || teamToken.trim() === '') {
      throw new Error('团队 Token 不能为空');
    }
    this.teamToken = teamToken;
    this.config = config ?? new BorderConfig();
  }

  /**
   * 创建客户端构建器
   */
  static builder(): BorderClientBuilder {
    return new BorderClientBuilder();
  }

  /**
   * 提交审核
   *
   * @param pipelineIdOrRequest 流水线ID 或完整的请求对象
   * @param content 待审核内容（当第一个参数为 pipelineId 时需要）
   * @returns 审核响应
   */
  async submit(
    pipelineIdOrRequest: number | SubmitRequest,
    content?: string
  ): Promise<SubmitResponse> {
    let request: SubmitRequest;

    if (typeof pipelineIdOrRequest === 'number') {
      request = {
        pipelineId: pipelineIdOrRequest,
        teamToken: this.teamToken,
        content: content ?? '',
      };
    } else {
      request = { ...pipelineIdOrRequest, teamToken: this.teamToken };
    }

    const url = new URL(this.config.apiUrl);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const body = JSON.stringify(request);

    return new Promise((resolve, reject) => {
      const req = transport.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: this.config.timeout,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response: SubmitResponse = JSON.parse(data);
              if (response.status !== 0) {
                reject(new BorderApiException(`审核提交失败: ${response.message}`, response.status));
                return;
              }
              resolve(response);
            } catch (e) {
              reject(new BorderApiException('解析响应失败'));
            }
          } else {
            reject(new BorderApiException(
              `API 请求失败，HTTP 状态码: ${res.statusCode}`,
              res.statusCode ?? -1
            ));
          }
        });
      });

      req.on('error', (e) => {
        reject(new BorderApiException('调用审核 API 失败', -1, e));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new BorderApiException('请求超时'));
      });

      req.write(body);
      req.end();
    });
  }
}

/**
 * 客户端构建器
 */
export class BorderClientBuilder {
  private teamToken = '';
  private apiUrl?: string;
  private timeout?: number;

  teamToken(token: string): this {
    this.teamToken = token;
    return this;
  }

  apiUrl(url: string): this {
    this.apiUrl = url;
    return this;
  }

  timeout(ms: number): this {
    this.timeout = ms;
    return this;
  }

  build(): BorderClient {
    const config = new BorderConfig({
      apiUrl: this.apiUrl,
      timeout: this.timeout,
    });
    return new BorderClient(this.teamToken, config);
  }
}
