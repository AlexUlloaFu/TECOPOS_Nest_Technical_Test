FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG APP_NAME
RUN npx nest build ${APP_NAME}

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

EXPOSE 3000 3001 3002

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
