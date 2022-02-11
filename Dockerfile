# Install dependencies only when needed
# Use node:17-slim
FROM node@sha256:5e1c50b7686bcaf01b800966bf52d83a2530ea521290bba6eb0fd4eae3025055 AS deps
# for some reason the $PATH get lost inside kaniko, if we re-set it by hand it seems to work. 
ENV PATH="$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
# Use node:17-slim
FROM node@sha256:5e1c50b7686bcaf01b800966bf52d83a2530ea521290bba6eb0fd4eae3025055 AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx browserslist@latest --update-db
RUN mkdir ./localstorage && echo "4" >> ./localstorage/version
RUN npm run build && npm install --only=production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
# Use node:17-slim
FROM node@sha256:5e1c50b7686bcaf01b800966bf52d83a2530ea521290bba6eb0fd4eae3025055 AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --gid 1001 --system nodejs
RUN adduser --system nextjs --uid 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node_modules/.bin/next", "start"]
