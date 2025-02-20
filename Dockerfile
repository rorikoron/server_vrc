# 使用するNode.jsのバージョンを指定
FROM node:22

# 作業ディレクトリの作成
WORKDIR /usr/src

# パッケージのインストール
COPY package*.json ./
RUN npm install

# ソースコードをコンテナにコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# サーバー起動コマンド
CMD ["npm", "run", "dev"]
