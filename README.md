# AI Cook
（其实是为了解决本人炒菜需要去拿手机看步骤的痛点，满足每个步骤倒计时+语音提醒）
已部署好地址：https://practice-cooking.onrender.com
以下由ChatGPT生成：
AI Cook Companion is a uni-app cooking assistant with:

- a `uni-app` frontend for H5 and WeChat Mini Program
- a small `Express` backend that proxies Dify workflow calls

## Project Structure

- `src/`: frontend app
- `server/`: backend API for Dify
- `dist/build/h5/`: H5 build output
- `dist/build/mp-weixin/`: WeChat Mini Program build output

## Local Development

Frontend:

```bash
npm install
npm run dev:h5
```

Backend:

```bash
cd server
npm install
cp .env.example .env
```

Set these backend env vars in `server/.env`:

```env
PORT=3000
CORS_ORIGIN=*
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxxxxxxxxxx
DIFY_OUTPUT_KEY=result
DIFY_USER_PREFIX=ai-cook
```

Then start the backend:

```bash
npm run dev
```

## Build

Build H5:

```bash
npm run build:h5
```

Build WeChat Mini Program:

```bash
npm run build:mp-weixin
```

## Deployment Shape

- Frontend H5: deploy the static files under `dist/build/h5/`
- Backend API: deploy the `server/` folder as a Node 18+ web service

For production, update the frontend `serverBaseUrl` to your public backend URL.

## Render Deployment

This repo includes a root `render.yaml` so you can create both services from Render Blueprint:

- `ai-cook-backend`: Express API from `server/`
- `ai-cook-frontend`: static H5 site from `dist/build/h5/`

Before the first deploy in Render:

1. Create services from the Blueprint in this repo.
2. Set `DIFY_API_KEY` on the backend service.
3. Set `VITE_SERVER_BASE_URL` on the frontend service to your backend public URL, such as `https://ai-cook-backend.onrender.com`.
4. Redeploy the frontend after setting `VITE_SERVER_BASE_URL`.

## Notes
- If you change the Dify workflow, remember to publish the workflow before testing through the backend API
