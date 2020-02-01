# 高解像度視覚刺激システム
## 準備
### OpenGL
- glfwインストール
~~~
apt-get install libglfw3 libglfw3-dev
~~~

### GL-Console(https://github.com/KazukiHiraizumi/GL-Console)
- インストール方法
~~~
git clone https://github.com/KazukiHiraizumi/GL-Console
cd GL-Console
make kio
sudo make install
~~~

### Httpd "Lighttpd"
- インストール方法
~~~
sudo apt-get install lighttpd
~~~

- "/etc/lighttpd/lighttpd.conf"に以下を加える
~~~
   server.modules += (
      "mod_cgi"
   )
   cgi.assign = ( ".sh"  => "/bin/bash" )
~~~
- ページのホームを指定
~~~
ln -fs /home/<your accont>/HRS /var/www/html
~~~
- 自動起動に設定
~~~
sudo systemctl start lighttpd.service
~~~

### Node.js
- インストール方法
~~~
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs
sudo apt-get install npm
~~~
- パッケージ追加
npm -g install ws performance-now dgram

### その他ツール
- unclutter マウスカーソルを消す
~~~
sudo apt-get install unclutter
~~~

## セットアップ
- セッションマネージャに "start.sh" を登録
- 表示言語の選択
~~~
  cd HRS
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
