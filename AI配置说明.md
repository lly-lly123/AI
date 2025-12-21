# AI助手配置说明

## 概述

Evo智能助手现在支持多个AI服务提供商，优先使用国内可访问的服务，无需VPN即可使用。

## 配置步骤

### 方法1：使用智谱AI（推荐，国内可访问）

1. 访问 https://open.bigmodel.cn/
2. 注册账号并获取API Key
3. 在 `.env` 文件中配置：
   ```
   ZHIPU_API_KEY=your-zhipu-api-key-here
   ```
4. 重启后端服务

### 方法2：使用通义千问（阿里云，国内可访问）

1. 访问 https://dashscope.aliyun.com/
2. 注册账号并获取API Key
3. 在 `.env` 文件中配置：
   ```
   QWEN_API_KEY=your-qwen-api-key-here
   ```
4. 重启后端服务

### 方法3：使用Hugging Face（需要VPN）

1. 访问 https://huggingface.co/settings/tokens
2. 创建API Token
3. 在 `.env` 文件中配置：
   ```
   HUGGING_FACE_API_KEY=your-huggingface-api-key-here
   ```
4. 重启后端服务

## 优先级说明

系统会按以下优先级自动选择可用的AI服务：

1. **智谱AI**（如果配置了API Key）
2. **通义千问**（如果配置了API Key）
3. **Hugging Face**（如果配置了API Key，需要VPN）
4. **改进的本地AI逻辑**（如果所有AI服务都不可用）

## 无需配置即可使用

即使不配置任何AI服务的API Key，系统也会使用改进的本地AI逻辑，提供基本的智能回复功能。

## 注意事项

- 推荐使用智谱AI或通义千问，因为它们在国内可以直接访问，无需VPN
- 如果所有AI服务都不可用，系统会自动使用本地AI逻辑作为fallback
- 配置API Key后，请重启后端服务使配置生效































