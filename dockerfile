FROM node:latest

# 切换到 root 用户以执行安装命令
USER root

# 1. 安装基础依赖并启用32位支持
RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        software-properties-common \
        gnupg \
        wget \
        ca-certificates

# 2. 添加 WineHQ 的密钥和仓库
RUN wget -O- https://dl.winehq.org/wine-builds/winehq.key | apt-key add - && \
    apt-add-repository 'deb https://dl.winehq.org/wine-builds/debian/ bullseye main'

# 3. 安装 Wine
RUN apt-get update && \
    apt-get install -y --install-recommends winehq-stable

# 4. 设置工作目录并复制文件
WORKDIR /meisterhau
COPY . /meisterhau/
ADD dev.tar.gz /meisterhau/dev

# 5. 安装 Node.js 依赖
RUN npm i -g typescript rollup pnpm
RUN npm i

# 6. 使用 Wine 运行 Windows 可执行文件
CMD ["wine", "/meisterhau/dev/bedrock_server_mod.exe"]
