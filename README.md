## Getting Started

### 言語

実態としては、linuxあるいはwindows上でのNode.js。プログラミング言語としては、TypeScript。

* [TypeScript](https://www.typescriptlang.org/)

### 開発方法

npmでパッケージをインストール。

```shell
npm install
```

* [npm](https://www.npmjs.com/)

typescriptをjavascriptにコンパイル。

```shell
npm run build -- -w
```

npmでローカルサーバーを起動。

```shell
npm start
```

### Environment variables

| Name                                                 | Required              | Value       | Purpose                                    |
| ---------------------------------------------------- | --------------------- | ----------- | ------------------------------------------ |
| `DEBUG`                                              | false                 | modric-api:* | Debug                                      |
| `NODE_ENV`                                           | true                  |             | environment name                           |
| `MONGOLAB_URI`                                       | true                  |             | MongoDB connection URI                     |
| `API_ENDPOINT`                                       | true                  |             | cinerino endpoint URI                     |
| `CLIENT_ID`                                       | true                  |             | client id                     |
| `CLIENT_SECRET`                                       | true                  |             |client secret                     |
| `AUTHORIZE_SERVER_DOMAIN`                                       | true                  |             | 認可サーバドメイン                     |

## tslint

コード品質チェックをtslintで行う。

* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)

`npm run check`でチェック実行。

## clean

`npm run clean`で不要なソース削除。

## テスト

`npm test`でテスト実行。
