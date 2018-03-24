# NoPic  

PIC serial monitor powered by Node.js

## 準備  
- Node.jsインストール  
 https://nodejs.org/en/download/ からPCに合ったものをダウンロードしてインストールします。  
- Node.jsライブラリ  
 NodeJSは様々なライブラリ(パッケージ)が配布されています。パッケージをインストールするには
npmというツールを使います。以下のパッケージが必要です。  
  - ws, seriaport, http-server  
各パッケージの説明は https://www.npmjs.com/ で探せます。  
- パッケージのインストール  
1. メニュー&rarr;Node.js&rarr;Node.js command prompt を選択  
2. 以下を入力する  
~~~
npm install ws
npm install serialport
npm install http-server
~~~
3. HOMEフォルダ以下にnode_modulesフォルダが作られていることを確認する。  

## アプリのダウンロード  
1. ページの右の方の「Clone or download」ボタンを押して、ZIP形式でダウンロードする。または以下のURLからDL  
  - https://github.com/KazukiHiraizumi/NoPic/archive/master.zip
2. PCで展開する  

## アプリのスタート  
1. Httpdの実行  
Node.js command promptで先のアプリを展開したフォルダに移動する。ホーム下にNoPICフォルダを置いたとすると
~~~
cd NoPIC
~~~
そこでHttpサーバを起動する。以下を入力。
~~~
node ..\node_modules\http-server\bin\http-server
~~~
または以下のバッチファイルを起動
~~~
http-10.bat
~~~
セキュリティ警告が出た場合は、許可するを選択する。  
正常に起動できたら以下のメッセージが表示される  
~~~
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.99.9:8080
Hit CTRL-C to stop the server
~~~
2. Bluetooth接続  
<img src="blueman.png" style="width:100px;" /><br clear="all">
「Bluetooth設定」ツールにて「接続」する。

3. バックエンドの起動  
新たなNode.js command promptを開く。NoPICフォルダに移動。以下を入力。
~~~
cd NoPIC
~~~
バックエンドプログラムを起動
~~~
node backend.js
~~~
4. フロントエンドの起動  
Webブラウザで http://localhost:8080/ に接続する。  command promptに
~~~
[server message] Connnected
~~~
と表示されたらOKです。

## 操作
1. RELOADボタン  
DCユニットのROMデータを読み込みます。
2. WRITEボタン  
変更した箇所を書き込みます。
