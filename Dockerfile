FROM node:16

RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libu2f-udev \
    xdg-utils \
    libgbm-dev \
    chromium-browser \
    --no-install-recommends

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium-browser/

EXPOSE 5000

CMD ["npm", "start"]
