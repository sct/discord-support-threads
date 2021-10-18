FROM node:16.10-alpine AS builder

WORKDIR /app

COPY . /app

RUN yarn install --frozen-lockfile
RUN yarn build

# remove development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

FROM node:16.10-alpine

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

CMD ["node", "dist"]
