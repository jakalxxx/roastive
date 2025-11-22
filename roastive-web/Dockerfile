FROM node:20-alpine
WORKDIR /workspace/apps/web
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY package.json ../../package.json
COPY pnpm-workspace.yaml ../../pnpm-workspace.yaml
COPY ../../packages ./../../packages
RUN pnpm install -r --silent
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

