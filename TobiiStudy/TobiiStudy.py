#!/usr/bin/python

from socket import socket, AF_INET, SOCK_DGRAM
from websocket_server import WebsocketServer
import threading
import time
import re
import os
import numpy as np
import random
import tobii_research as tr

#Tobii EyeTracker globals
sequence = 1
eyetracker = None
gaze_data = []
gaze_cmd = {}
gaze_now = None
gaze_strobe = 0

#5001 ET status server
sock1=WebsocketServer(5001, host="localhost")
client1=None
def sock1_on_connect(client, server):
  global client1
  print("sock1 connected")
  client1=client
  server.send_message(client,"A new client joined!")
def sock1_on_disconnect(client, server):
  global client1
  print("sock1 disconected")
  client1=None
def sock1_on_received(client, server, message):
  print("sock1 received:"+message)
def sock1_start():
  if client1:
    stat={"connect":0,"left":0,"right":0}
    if gaze_now is not None:
      stat["connect"]=1
      stat["left"]=gaze_now["left_gaze_point_validity"]
      stat["right"]=gaze_now["right_gaze_point_validity"]
    res=re.sub("'",'"',str(stat))
    sock1.send_message(client1,res)
#    print("sock1 send ",res)
    t1=threading.Timer(0.1,sock1_start)
    t1.start()
  else:
    t1=threading.Timer(1,sock1_start)
    t1.start()
sock1.set_fn_new_client(sock1_on_connect)
sock1.set_fn_client_left(sock1_on_disconnect)
sock1.set_fn_message_received(sock1_on_received)
sock1_start()

#5002 ET data server
sock2=WebsocketServer(5002, host="localhost")
client2=None
def sock2_on_connect(client, server):
  global client2
  print("sock2 connected")
  client2=client
  server.send_message(client,"sock2 connected")
def sock2_on_disconnect(client, server):
  global client2
  print("sock2 disconnected")
  client2=None
def sock2_on_received(client, server, message):
  print("sock2 received:"+message)
sock2.set_fn_new_client(sock2_on_connect)
sock2.set_fn_client_left(sock2_on_disconnect)
sock2.set_fn_message_received(sock2_on_received)

#Threading start
thread1 = threading.Thread(target=sock1.run_forever)
thread1.start()
thread2 = threading.Thread(target=sock2.run_forever)
thread2.start()

#Tobii EyeTracker
def gaze_callback(data):
  global gaze_now,gaze_data
  t=time.time()-gaze_strobe
  data["time"]=t
  gaze_now=data
#  print("time",t)
  if gaze_strobe>0: gaze_data.append(data)

def dummy_callback():
  global gaze_now,gaze_data
  t=time.time()-gaze_strobe
  tc=t*10
  data={
    "time":t,
    "left_gaze_point_validity":int(random.random()>0.1),
    "left_gaze_point_on_display_area":(np.sin(tc),0),
    "right_gaze_point_validity":int(random.random()>0.1),
    "right_gaze_point_on_display_area":(np.cos(tc),0)}
  gaze_now=data
  if gaze_strobe>0: gaze_data.append(data)
  t1=threading.Timer(0.01,dummy_callback)
  t1.start()

def gaze_sample(cmd):
  global gaze_data,gaze_strobe
  gaze_data=[]
  gaze_strobe=time.time()
  print("sequence:",sequence)
  time.sleep(cmd["tm1"]+cmd["tm2"])
  gaze_strobe=0

etrs=tr.find_all_eyetrackers()
for et in etrs:
  print(et.address)
eyetracker = tr.EyeTracker(etrs[0].address)
eyetracker.subscribe_to(tr.EYETRACKER_GAZE_DATA, gaze_callback, as_dictionary=True)  #eyetracker start streaming
#dummy_callback()

#Trigger
sock0=socket(AF_INET, SOCK_DGRAM)
sock0.bind(('',5000)) #5000 UDP socket for trigger
def sock0_on_received(msg):
  global sequence,gaze_cmd
  val=eval(msg)
  for k in val: gaze_cmd[k]=float(val[k])*0.001
  gaze_cmd["t0"]=time.time()
  gaze_cmd["t1"]=gaze_cmd["tm1"]+gaze_cmd["tm2"]
  gaze_sample(gaze_cmd)
  print("Start broadcast "+str(time.time()))
  result={"seq":sequence,"time":[],"left":[],"right":[]}
  for d in gaze_data:
    if d["left_gaze_point_validity"]>0 and d["right_gaze_point_validity"]>0:
      result["time"].append(d["time"])
      result["left"].append((d["left_gaze_point_on_display_area"][0]-0.5)*2)
      result["right"].append((d["right_gaze_point_on_display_area"][0]-0.5)*2)
  result["tm1"]=gaze_cmd["tm1"]
  result["tm2"]=gaze_cmd["tm2"]
  res=re.sub("'",'"',str(result))
  if client2 is not None: sock2.send_message(client2,res)
  print("file dump "+os.getcwd())
  f=open('dump.csv', mode='a')
  f.write('Seq,'+str(sequence)+'\n')
  f.write(','.join(map(str,result["time"])))
  f.write('\n')
  f.write(','.join(map(str,result["left"])))
  f.write('\n')
  f.write(','.join(map(str,result["right"])))
  f.write('\n')
  f.close()
  sequence=sequence+1

while True:
  msg, address = sock0.recvfrom(256)
  sock0_on_received(msg)

thread1.join()
thread2.join()

eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_callback)
