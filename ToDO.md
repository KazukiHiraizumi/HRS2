1. /etc/lighttpd/lighttpd.conf  

~~~
server.document-root = "/home/yoods/HRS2"
server.port = 8080
server.modules += (
  "mod_cgi"
)
cgi.assign = ( ".sh"  => "/bin/bash" )
~~~

2. setting[123]/*.json  
permissionを666にする


