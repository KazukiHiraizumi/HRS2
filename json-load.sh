#!/bin/bash

name=$(echo $QUERY_STRING | sed -e's/%2F/\//')
cat $name.json
