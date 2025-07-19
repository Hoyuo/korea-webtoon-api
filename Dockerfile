# 공식 Node.js 20 이미지를 기반으로 합니다.
FROM node:20-bullseye-slim

# 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# Puppeteer에 필요한 종속성을 설치합니다.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# package.json과 yarn.lock을 복사합니다.
COPY package.json yarn.lock ./

# 의존성을 설치합니다.
RUN yarn install --frozen-lockfile --production=false

# 애플리케이션 소스 코드를 복사합니다.
COPY . .

# 애플리케이션을 빌드합니다. (package.json에 "build" 스크립트가 있다고 가정)
RUN yarn build

# 애플리케이션 시작 명령을 설정합니다. (package.json에 "start" 스크립트가 있다고 가정)
CMD ["yarn", "start"]