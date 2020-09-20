#!/bin/bash

name=$(echo ${QUERY_STRING%'%7B'*} | sed -e's/%2F/\//')
qstr=$(echo {${QUERY_STRING#*'%7B'} | sed -e's/%22/\"/g' | sed -e's/%20/ /g' | sed -e's/%7D/}/g')
echo $qstr>$name.json
chmod 666 $name.json
echo Save to $name.json $qstr
