#!/usr/bin/python

from socket import socket, AF_INET, SOCK_DGRAM

HOST = ''   
PORT = 5001

s = socket(AF_INET, SOCK_DGRAM)
s.bind((HOST, PORT))

while True:
    msg, address = s.recvfrom(8192)
    print "message: ",msg,"from: ",address

s.close()
