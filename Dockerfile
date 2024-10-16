
# Builder stage
FROM node:18-alpine as builder

USER root

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# RUN apk update && \
#     apk install -y libc6 && \
#     apk install -y git && \
#     rm -rf /var/lib/apt/lists/*

RUN apk update && \
    apk add --no-cache \
    libc6-compat \
    git \
    gnupg \
    wget \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont && \
    rm -rf /var/cache/apk/*


USER node
WORKDIR /home/node

COPY package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npm prune --production

# Production stage
FROM node:18-alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apk update && \
    apk add --no-cache \
    libc6-compat \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont && \
    rm -rf /var/cache/apk/*

# Set environment variables for Chromium
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
USER node
WORKDIR /home/node

# Copy the application files from the builder stage
COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/

EXPOSE 4560

CMD ["node", "index.js"]
