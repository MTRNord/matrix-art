# Install dependencies only when needed
# Use node:16-alpine
FROM node@sha256:b48580972490b3344047758d93ac454fe6fa0dc0bb7690a4f75212485b4afd5d AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
# Use node:16-alpine
FROM node@sha256:b48580972490b3344047758d93ac454fe6fa0dc0bb7690a4f75212485b4afd5d AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps package-lock.json ./
RUN npx browserslist@latest --update-db
RUN npm run build && npm install --only=production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
# Use node:16-alpine
FROM node@sha256:b48580972490b3344047758d93ac454fe6fa0dc0bb7690a4f75212485b4afd5d AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node_modules/.bin/next", "start"]