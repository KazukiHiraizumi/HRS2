#!/bin/bash

unclutter -idle 3 &
cd /var/www/html ; NODE_PATH=/usr/lib/node_modules node cav8.njs &

