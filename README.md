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

3. Front end  
C3.js D3.jsが必要。  
D3.jsはV6はダメなので注意(V5.16.0を推奨)

4. HRS2  
~~~
git clone https://github.com/KazukiHiraizumi/HRS2.git
~~~

5. httpd
~~~
sudo apt install lighttpd
~~~
"/etc/lighttpd/lighttpd.conf" を以下のように編集
~~~
   server.modules += (
      "mod_cgi"
   )
   cgi.assign = ( ".sh"  => "/bin/bash" )
   server.document-root = "/home/ca/HRS2"
~~~
serviceを登録
~~~
sudo cp /usr/lib/systemd/system/lighttpd.service /var/run/
~~~
これにてserviceコマンドで起動できるので後述のWinの**wsl**コマンドで起動する
~~~
sudo service lighttpd start
~~~
Windows側からは**wsl**コマンドで起動できる。
~~~
wsl -u root -- service lighttpd start
~~~
serviceコマンドはroot権限が必要なので、通常のアカウントから起動するには、次のsudoers設定が必要である。

6. sudoのパスワード省略
~~~
sudo visudo
~~~
以下のコマンドを通常アカウントから起動できるようにする。
~~~
<username> ALL=NOPASSWD: /sbin/service lighttpd start
<username> ALL=NOPASSWD: /bin/tee -a /etc/hosts
~~~
teeコマンドは、resolve_hosts.sh(Winホストのアドレスを登録するコマンド)で必要です。

7. Permission変更
HRS2のOwner変更
~~~
sudo chown -R <user>:<group> HRS2
~~~
Permission変更
~~~
chmod 777 HRS2
chmod 777 HRS2/setting*
chmod 777 HRS2/html
~~~
teeコマンドは、resolve_hosts.sh(Winホストのアドレスを登録するコマンド)で必要です。

8. Windowsから起動  
start.sh resolve_hosts.shを/usr/local/binへコピー
~~~
sudo cp start.sh resolve_hosts.sh /usr/local/bin
~~~
Win側のwslコマンドで起動するため、start.shとresolve_hosts.shを/usr/local/binへコピー
~~~
sudo cp start.sh resolve_hosts.sh /usr/local/bin
~~~
OKN.batファイルにて一括起動します
~~~
@powershell -NoProfile -ExecutionPolicy Unrestricted "$s=[scriptblock]::create((gc \"%~f0\"|?{$_.readcount -gt 1})-join\"`n\");&$s" %*&goto:eof

Start-Process "C:\Users\user\source\repos\KazukiHiraizumi\GL-Server\x64\Debug\GL-Server.exe"
Start-Process python '\\wsl$\Ubuntu\home\ca\HRS2\TobiiStudy\TobiiStudy.py'
wsl -u root -- service lighttpd start
wsl -u root -e resolve_hosts.sh
wsl -u ca -e start.sh
~~~

9. 表示言語の選択
~~~
cd HRS2
./jp.sh  //Japanese
./en.sh  //English

~~~

## トラブルシュート  

1. GL-Serverの単体テスト  
- Win側で起動
- TCP port 8888を使用
  - telnetで接続テスト

2. cav8.jssの単体テスト
- WSL側で起動
- Websocket port 5000を使用

3. TobiiStudy.pyの単体テスト  
WindowsのPython3で動作します。ただしPythonファイルはWSLのHRS2を参照します。
~~~
python '\\wsl$\Ubuntu\home\ganka\HRS2\TobiiStudy\TobiiStudy.py'
~~~

## 操作
~~~
1. ブラウザーにて"localost/home.html"を開く
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
