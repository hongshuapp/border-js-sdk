/**
 * 提交审核请求参数
 */
export interface SubmitRequest {
  /** 流水线ID（必填） */
  pipelineId: number;
  /** 团队认证Token（必填） */
  teamToken: string;
  /** 待审核内容（必填）：文本为文本内容，图片/音频/视频为可访问URL */
  content: string;
  /** 自定义环境变量（可选） */
  env?: Record<string, unknown>;
}

/**
 * 提交审核响应
 */
export interface SubmitResponse {
  /** 状态码，0 表示成功 */
  status: number;
  /** 响应消息 */
  message: string;
  /** 流水线实例ID */
  body: number;
}
