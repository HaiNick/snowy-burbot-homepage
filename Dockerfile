# syntax=docker/dockerfile:1

# Build stage: Node builds the static site into /app/dist.
# Node 26 is the active LTS line. The floating tag picks up security patches
# on every rebuild; the weekly scheduled workflow run makes sure that happens.
# Mermaid diagrams render in Chromium during the build, so Playwright installs
# Chromium and its system libraries here. Nothing from this stage ships.
FROM node:26-trixie-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund \
 && npx playwright install --with-deps chromium
COPY . .
RUN npm run build

# Runtime stage: unprivileged nginx serves files on port 8080, nothing else.
# This is the only stage that runs in production, and it contains no Node.
# 1.30 is the nginx stable line; the floating tag picks up patch releases.
FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
