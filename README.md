# eoak-web
Website for End Of All Known

## Layout
- `web/` – Next.js app (`cd web && npm install && npm run dev`)
- `studio/` – standalone Sanity Studio (`cd studio && npm install && npm run dev`)

Sanity project: `lru32awc`, dataset `production`. Copy `web/.env.example` to `web/.env.local`.
Add the web origin to CORS: `cd studio && npx sanity cors add http://localhost:3000 --credentials`.
Deploy the schema with `cd studio && npm run deploy-schema` (requires `sanity login`).
