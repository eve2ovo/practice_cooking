# AI Cook Companion

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

## Notes

- Do not commit `server/.env`
- The Dify API key should stay server-side only
- If you change the Dify workflow, remember to publish the workflow before testing through the backend API
