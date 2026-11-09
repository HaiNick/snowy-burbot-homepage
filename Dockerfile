# syntax=docker/dockerfile:1

# Build stage: Node builds the static site into /app/dist.
# Mermaid diagrams render in Chromium during the build, and Playwright has no
# Alpine build. Keep this tag equal to the playwright version in package.json.
FROM mcr.microsoft.com/playwright:v1.65.0-noble AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Runtime stage: unprivileged nginx serves files on port 8080, nothing else
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
