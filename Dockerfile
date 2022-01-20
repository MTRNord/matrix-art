# Install dependencies only when needed
# Use node:17-slim
FROM node@sha256:7c6fb786d7a9f38f5c0f0fa4845615c91441ab7406b13c808357b3b53e599bb2 AS deps
# for some reason the $PATH get lost inside kaniko, if we re-set it by hand it seems to work. 
ENV PATH="$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm cache verify && npm ci

# Rebuild the source code only when needed
# Use node:17-slim
FROM node@sha256:7c6fb786d7a9f38f5c0f0fa4845615c91441ab7406b13c808357b3b53e599bb2 AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps package-lock.json ./
RUN npx browserslist@latest --update-db
RUN npm run build && npm install --only=production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
# Use node:17-slim
FROM node@sha256:7c6fb786d7a9f38f5c0f0fa4845615c91441ab7406b13c808357b3b53e599bb2 AS runner
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