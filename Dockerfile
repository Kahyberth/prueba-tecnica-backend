FROM oven/bun:1 AS dependencies

WORKDIR /usr/src/app


RUN apt-get update -y && apt-get install -y openssl

COPY package.json bun.lock ./

RUN bun install


FROM oven/bun:1 AS builder

ARG ARG_DATABASE_URL

WORKDIR /usr/src/app


RUN apt-get update -y && apt-get install -y openssl

COPY --from=dependencies /usr/src/app/node_modules node_modules

COPY . .

ENV DATABASE_URL=$ARG_DATABASE_URL


RUN bun prisma generate

RUN bun run build



FROM oven/bun:1 AS final

WORKDIR /usr/src/app


RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /usr/src/app/node_modules node_modules

COPY --from=builder /usr/src/app/dist dist

COPY --from=builder /usr/src/app/tsconfig.json tsconfig.json


COPY --from=builder /usr/src/app/prisma prisma

USER bun

EXPOSE 8080

CMD ["sh", "-c", "sleep 10 && bun prisma migrate deploy && bun dist/main.js"]
