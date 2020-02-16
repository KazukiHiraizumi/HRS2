# 高解像度視覚刺激システム

## Windowsの場合
### インストール
1. WSL  
設定→アプリから「WSL」を有効にする
2. GL-Server  
https://github.com/KazukiHiraizumi/GL-Server をビルドする。

### WSLのセットアップ
1. Nodejs
~~~
sudo apt update
sudo apt install nodejs
~~~
バージョン確認
~~~
node -v
~~~
ver8以上ならOK

2. npmのインストール
~~~
sudo apt update
sudo apt install npm
~~~
以下パッケージを追加
~~~
npm install ws performance-now dgram
~~~

3. HRS2  
~~~
git clone https://github.com/KazukiHiraizumi/HRS2.git
~~~

4. httpd
~~~
sudo apt-get install lighttpd
~~~
"/etc/lighttpd/lighttpd.conf" を以下のように編集
~~~
   server.modules += (
      "mod_cgi"
   )
   cgi.assign = ( ".sh"  => "/bin/bash" )
   server.document-root = "/home/ca/HRS2"
~~~

5. sudoer編集
~~~
sudo visudo
~~~
以下を追加
~~~
<username> ALL=NOPASSWD: ALL
~~~
~Xにて終了

6. .bashrc編集  
以下を追加
~~~
dn=$(ps ax | grep lighttpd | wc -l)
if (( dn==1 ))
then
  sudo lighttpd -f /etc/lighttpd/lighttpd.conf
fi
cd HRS2
node cav8.jss
~~~

7. 表示言語の選択
~~~
cd HRS2
./jp.sh  //Japanese
./en.sh  //English
~~~
## 操作
~~~
1. ブラウザーにてJETSONのアドレスの"home.html"を開く
~~~

## ファイルの説明
### 画面表示制御
1. cav8.jss メインプログラム
2. prog1.js プログラム1
3. prog2.js プログラム2
4. prog3.js プログラム3
5. wsshare.js,jquery.js,promise-xhr.js ライブラリプログラム

### 操作画面
1. okn.css    スタイルシート
2. home.html   ホーム
3. panel1.html プログラム1
4. panel2.html プログラム2
5. panel3.html プログラム3
6. dictionary.txt 英語変換用辞書

### その他
1. json-*.sh ファイル操作下請けツール
2. jp.sh 表示言語日本語化ツール
3. en.sh 表示言語日本語化ツール
4. poweroff.sh 電源切ツール
