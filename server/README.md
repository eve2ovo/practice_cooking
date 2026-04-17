# AI 做饭陪练后端示例

这是一个最小可部署的 Node/Express 后端示例，用来代理 Dify workflow。

## 目录说明

- `src/index.js`：Express 服务入口
- `src/recipe-result.js`：菜谱结果标准化与校验
- `.env.example`：环境变量示例
- `WORKFLOW_V2.md`：推荐的 Dify workflow v2 设计方案、提示词与知识库组织方式

## 先决条件

- Node.js 18+
- 一个已经发布的 Dify workflow 应用 API Key
- Dify workflow 的 Output 节点建议输出 `result` 对象

## 安装

```bash
cd server
npm install
```

## 环境变量

复制 `.env.example` 为 `.env`，填写：

```env
PORT=3000
CORS_ORIGIN=*
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx
DIFY_OUTPUT_KEY=result
DIFY_USER_PREFIX=ai-cook
```

说明：
- `DIFY_BASE_URL`：Dify API 基础地址
- `DIFY_API_KEY`：你的 Dify 应用 API Key，只放服务端
- `DIFY_OUTPUT_KEY`：Output 节点输出字段名，默认 `result`

## 启动

```bash
npm run dev
```

## 接口

### 健康检查

```http
GET /api/recipe/health
```

### 生成菜谱

```http
POST /api/recipe/generate
Content-Type: application/json
```

请求体示例：

```json
{
  "dishName": "番茄炒蛋",
  "servings": 2,
  "taste": "微辣",
  "availableIngredients": "鸡蛋,番茄,小葱"
}
```

返回体示例：

```json
{
  "success": true,
  "provider": "dify",
  "result": {
    "dishName": "番茄炒蛋",
    "description": "一道适合新手的家常菜。",
    "servingSize": 2,
    "difficulty": "EASY",
    "totalDuration": 540,
    "ingredients": [],
    "prepTips": [],
    "timelineSteps": []
  },
  "raw": {
    "workflowRunId": "",
    "status": "succeeded"
  }
}
```

## 和当前 uni-app 的对接方式

小程序设置页里填写：

- `serverBaseUrl`: 本地开发可用 `http://localhost:3000`；微信真机预览、体验版和正式版必须使用公网 HTTPS 地址
- `generatePath`: `/api/recipe/generate`
- `healthPath`: `/api/recipe/health`

前端会只请求这个后端，再由后端去调用 Dify workflow。`r`n`r`n注意：如果是在微信开发者工具之外的真机环境测试，还需要把后端域名配置到微信小程序后台的 request 合法域名。

