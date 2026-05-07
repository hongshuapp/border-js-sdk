import { createHmac } from 'crypto';
import { BorderSignatureException } from './exception';

/**
 * 签名验证工具类
 * 用于验证回调请求的签名，确保请求的合法性和数据完整性
 */
export class SignatureUtil {
  /**
   * 验证回调签名
   *
   * @param teamId 团队ID
   * @param pipelineInstanceId 流水线实例ID
   * @param seed 提交审核时在 env 中设置的 seed 值
   * @param data 回调请求的原始内容
   * @param xSignature 请求 Header 中的 x-signature 值
   * @returns 验签是否通过
   */
  static verify(
    teamId: string,
    pipelineInstanceId: string,
    seed: string,
    data: string,
    xSignature: string
  ): boolean {
    try {
      const calculatedSignature = this.signature(teamId, pipelineInstanceId, seed, data);
      return calculatedSignature === xSignature;
    } catch {
      return false;
    }
  }

  /**
   * 计算签名
   * 使用 HMAC-SHA256 算法
   *
   * @param teamId 团队ID
   * @param pipelineInstanceId 流水线实例ID
   * @param seed 签名种子字符串
   * @param data 原始数据内容
   * @returns Base64 编码的签名字符串
   */
  static signature(
    teamId: string,
    pipelineInstanceId: string,
    seed: string,
    data: string
  ): string {
    const secretKey = teamId + pipelineInstanceId + seed;
    return createHmac('sha256', secretKey).update(data).digest('base64');
  }
}
