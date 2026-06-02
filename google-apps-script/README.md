# Google Apps Script setup

1. Google Driveで新しいApps Scriptを作成します。
2. `Code.gs` の内容を貼り付けます。
3. Apps Script上で `setup` を一度実行し、権限を許可します。
4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選びます。
5. 実行ユーザーは「自分」、アクセスできるユーザーは「全員」にします。
6. 発行されたWebアプリURLを `index.html` のフォーム `action` に設定します。
   - 例: `https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec`
   - `REPLACE_WITH_GOOGLE_APPS_SCRIPT_WEB_APP_ID` をApps ScriptのID部分に差し替えるか、`action` 全体を発行URLに置き換えます。
   - VercelのURLではなく、Apps ScriptのWebアプリURLを入れます。

`setup` 実行時、または初回送信時に `Tonari AI お問い合わせ管理` というスプレッドシートが自動作成されます。
