@powershell -NoProfile -ExecutionPolicy Unrestricted "$s=[scriptblock]::create((gc \"%~f0\"|?{$_.readcount -gt 1})-join\"`n\");&$s" %*&goto:eof

Start-Process "C:\Users\yoods\source\repos\KazukiHiraizumi\GL-Server\x64\Debug\GL-Server.exe"
Start-Process python '\\wsl$\Ubuntu-18.04\home\kz\HRS2\TobiiStudy\TobiiStudy.py'
wsl -u root -- service lighttpd start
wsl -u kz -e start.sh