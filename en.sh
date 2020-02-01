#!/bin/bash

sed -f dictionary.txt html/home.html >home.html
sed -f dictionary.txt html/panel1.html >panel1.html
sed -f dictionary.txt html/panel2.html >panel2.html
sed -f dictionary.txt html/panel3.html >panel3.html
