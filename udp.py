#!/usr/bin/python

from socket import socket, AF_INET, SOCK_DGRAM

HOST = ''   
PORT = 5002

s = socket(AF_INET, SOCK_DGRAM)
s.bind((HOST, PORT))

while True:
	msg, address = s.recvfrom(256)
	val=eval(msg)
	for k in val: val[k]=int(val[k])
	print(val)

s.close()
