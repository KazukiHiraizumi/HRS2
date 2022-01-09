#!/bin/bash

#echo "Content-type: text/plain"

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
dirs=$(ls -1 $QUERY_STRING/*.json | sed -e's/.json//')
str=''
for f in $dirs
do
	str=$str$(echo -n $f'",' | sed -e's/.*\//"/')
done
echo -n '['${str%*,}']'
