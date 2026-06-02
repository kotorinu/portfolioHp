# Google Apps Script setup

このコードは、次のスプレッドシートに問い合わせを保存します。

https://docs.google.com/spreadsheets/d/1jwqfoQ17ljrjNfwjAgOhtfKv422o5CvH74Mttvvx2lI/edit

## 作り方

1. 上のスプレッドシートを開きます。
2. メニューの「拡張機能」→「Apps Script」を開きます。
3. エディタ内の `コード.gs` に、このフォルダーの `Code.gs` の内容をすべて貼り付けます。
4. Apps Script上で `setup` を一度実行し、権限を許可します。
5. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選びます。
6. 実行ユーザーは「自分」、アクセスできるユーザーは「全員」にします。
7. 発行されたWebアプリURLを `index.html` のフォーム `data-script-url` に設定します。
   - 例: `https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec`
   - `data-script-url=""` の空欄部分に、発行されたURLを入れます。
   - VercelのURLではなく、Apps ScriptのWebアプリURLを入れます。

`setup` 実行時に、シート名とヘッダー行が自動で整います。
