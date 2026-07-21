FROM node:20-bookworm-slim

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

ENV NODE_ENV=production
EXPOSE 5000

CMD ["pnpm", "start"]
