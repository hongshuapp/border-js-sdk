# 数字边境 Node.js SDK 🛡️

**[数字边境](https://border.hongshuapp.com)** 是一个灵活高效的内容审核平台，通过 AI + 人工复核的方式，帮助开发者快速检测文本、图片、音频、视频中的违规内容（如涉政、色情、暴力、诈骗等），保障平台内容安全。

本 SDK 是数字边境官方提供的 Node.js 客户端，帮助开发者以最简单的方式接入内容审核能力。

🌐 **官方网站**：[https://border.hongshuapp.com](https://border.hongshuapp.com)

[![npm](https://img.shields.io/badge/npm-coming%20soon-blue.svg)](https://www.npmjs.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node](https://img.shields.io/badge/Node.js-14%2B-orange.svg)](https://nodejs.org/)

## ✨ 功能特性

- 🚀 **简单易用**：几行代码即可提交内容审核
- 🔧 **多种调用方式**：支持简单方法调用、Builder 模式
- 🔐 **回调验签**：内置 HMAC-SHA256 验签工具，保障回调接口安全
- ⚙️ **灵活配置**：支持自定义 API 地址、超时时间等参数
- 📘 **TypeScript 支持**：完整的类型定义

## 📦 安装

```bash
npm install @hongshuapp/border-sdk
```

## 📖 快速开始

### 基础使用

#### 方式一：简单方法调用

```javascript
const { BorderClient } = require('@hongshuapp/border-sdk');

const client = new BorderClient('your-team-token');

// 提交文本审核
const response = await client.submit(1970702619188862988, '待审核的文本内容');
console.log('流水线实例ID:', response.body);
```

#### 方式二：Builder 模式

```javascript
const { BorderClient } = require('@hongshuapp/border-sdk');

const client = BorderClient.builder()
  .teamToken('your-team-token')
  .timeout(10000)
  .build();

const response = await client.submit({
  pipelineId: 1970702619188862988,
  content: '待审核的文本内容',
  env: { userId: '12345' }
});

console.log('流水线实例ID:', response.body);
```

### 📝 审核不同类型内容

**文本审核** 📄
```javascript
await client.submit(pipelineId, '这是一段需要审核的文本');
```

**图片审核** 🖼️
```javascript
await client.submit(pipelineId, 'https://example.com/image.jpg');
```

**音频审核** 🎵
```javascript
await client.submit(pipelineId, 'https://example.com/audio.mp3');
```

**视频审核** 🎬
```javascript
await client.submit(pipelineId, 'https://example.com/video.mp4');
```

> 注意：图片、音频、视频需要传入可访问的链接（URL）

### 🔄 自定义环境变量

```javascript
const response = await client.submit({
  pipelineId: 1970702619188862988,
  content: '待审核内容',
  env: {
    userId: '12345',
    resourceType: 'comment',
    customData: { key: 'value' }
  }
});
```

在回调中，您可以通过 `{{env.userId}}`、`{{env.resourceType}}` 等获取这些变量。

## 🔐 回调接口验签

### 开启验签

```javascript
await client.submit({
  pipelineId: 1970702619188862988,
  content: '待审核内容',
  env: {
    signature: {
      name: 'HMAC_SHA_256',
      seed: 'your-secret-seed',
      version: 'v1'
    }
  }
});
```

### 验证回调签名

```javascript
const { SignatureUtil } = require('@hongshuapp/border-sdk');

app.post('/callback', (req, res) => {
  const xSignature = req.headers['x-signature'];
  const body = JSON.stringify(req.body);

  const isValid = SignatureUtil.verify(
    'your-team-id',
    'pipeline-instance-id',
    'your-secret-seed',
    body,
    xSignature
  );

  if (!isValid) {
    return res.status(401).send('签名验证失败');
  }

  res.send('success');
});
```

> **重要提示**：验签时必须使用原始的请求体字符串。

### 验签参数说明

| 参数 | 说明 | 获取方式 |
|------|------|----------|
| teamId | 团队ID | 团队管理页面查看 |
| pipelineInstanceId | 流水线实例ID | 提交接口返回的 body 字段 |
| seed | 签名种子 | 提交审核时 env.signature.seed 设置的值 |
| data | 回调原始内容 | POST 接口为 request body，GET 接口为完整 URL |
| xSignature | 请求签名 | 从请求 Header 中获取 |

## ⚠️ 异常处理

```javascript
const { BorderApiException, BorderSignatureException } = require('@hongshuapp/border-sdk');

try {
  const response = await client.submit(pipelineId, content);
} catch (err) {
  if (err instanceof BorderApiException) {
    console.error('审核提交失败:', err.message);
    console.error('错误码:', err.errorCode);
  } else if (err instanceof BorderSignatureException) {
    console.error('签名验证失败:', err.message);
  } else {
    console.error('发生错误:', err.message);
  }
}
```

## 📖 完整示例

```javascript
const { BorderClient, BorderApiException, SignatureUtil } = require('@hongshuapp/border-sdk');

async function main() {
  const client = BorderClient.builder()
    .teamToken('your-team-token')
    .timeout(10000)
    .build();

  const pipelineId = 1970702619188862988;

  // 同步提交
  try {
    const response = await client.submit({
      pipelineId,
      content: '用户评论：这是一段待审核的内容',
      env: { userId: '1001', resourceType: 'comment' }
    });
    console.log('提交成功，实例ID:', response.body);
  } catch (err) {
    if (err instanceof BorderApiException) {
      console.error('提交失败:', err.message);
    }
  }

  // 提交并开启回调验签
  const response = await client.submit({
    pipelineId,
    content: 'https://example.com/image.jpg',
    env: {
      signature: {
        name: 'HMAC_SHA_256',
        seed: 'my-secret-seed',
        version: 'v1'
      }
    }
  });
  console.log('提交成功，实例ID:', response.body);
}

main();
```

## ❓ 常见问题

### 1. 接口返回出错怎么办？

- 检查流水线 ID 是否正确
- 检查团队 Token 是否正确
- 确保 JSON 格式正确，环境变量中如果变量是字符串需要加双引号
- 确保流水线实例已生成

### 2. 回调验签失败怎么办？

- 确保 seed 值与提交时一致
- 确保使用原始的请求体字符串进行验签
- 确保 teamId 和 pipelineInstanceId 正确

### 3. 如何获取 teamToken 和 teamId？

在平台的"团队管理"页面查看：
- teamToken：点击钥匙图标复制
- teamId：直接在团队信息中查看

## 📜 许可证

本项目采用 [Apache License 2.0](LICENSE) 许可证。

## 💬 反馈与支持

如果您有任何问题或建议，欢迎：

- 提交 [Issue](https://github.com/hongshuapp/border-js-sdk/issues)
- 访问 [数字边境官网](https://border.hongshuapp.com) 联系我们
