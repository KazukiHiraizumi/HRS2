@powershell -NoProfile -ExecutionPolicy Unrestricted "$s=[scriptblock]::create((gc \"%~f0\"|?{$_.readcount -gt 1})-join\"`n\");&$s" %*&goto:eof

Start-Process "C:\Users\ganka\source\repos\KazukiHiraizumi\GL-Server\x64\Debug\GL-Server.exe"
Start-Process python '\\wsl$\Ubuntu\home\ganka\HRS2\TobiiStudy\TobiiStudy.py'
wsl -u root -- /sbin/service lighttpd start
wsl -u root -e /usr/local/bin/resolve_hosts.sh
wsl -u ganka -e /usr/local/bin/start.sh
