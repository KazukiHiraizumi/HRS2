#!/usr/bin/python

from socket import socket, AF_INET, SOCK_DGRAM
from websocket_server import WebsocketServer
import threading
import time
import re
import numpy as np
import tobii_research as tr

#5001 ET status server
sock1=WebsocketServer(5001, host="localhost")
client1=None
def sock1_on_connect(client, server):
  global client1
  print("client({}) connected".format(client['id']))
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
    sock1.send_message(client1,'{"left":1,"right":1}')
    t1=threading.Timer(0.1,sock1_start)
    t1.start()
  else:
    print('No client')
    t1=threading.Timer(1,sock1_start)
    t1.start()
sock1.set_fn_new_client(sock1_on_connect)
sock1.set_fn_client_left(sock1_on_disconnect)
sock1.set_fn_message_received(sock1_on_received)
#sock1_start()

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
eyetracker = None
gaze_data = []
gaze_cmd = {}
def gaze_callback(data):
  global gaze_data
  gaze_data.append(data)

def gaze_sample(cmd):
  global gaze_data
  gaze_data=[]
  print("Subscribing to gaze data for eye tracker with serial number {0}.".format(eyetracker.serial_number))
  eyetracker.subscribe_to(tr.EYETRACKER_GAZE_DATA, gaze_callback, as_dictionary=True)
  print("Start sampling "+str(cmd['tm1']))
  time.sleep(cmd["tm1"]+cmd["tm2"])
  print("Stop  sampling")
  eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_callback)

def dummy_sample(cmd):
  global gaze_data
  gaze_data=[]
  tb=int(time.time())
  while True:
    t=time.time()-cmd["t0"]
    if t>cmd["t1"]: break
    tc=time.time()-tb
    data={
      "time":t,
      "left_gaze_point_validity":1,
      "left_gaze_point_on_display_area":np.sin(tc*9),
      "right_gaze_point_validity":1,
      "right_gaze_point_on_display_area":np.cos(tc*11)}
    gaze_data.append(data)
    time.sleep(0.01)

#etrs=tr.find_all_eyetrackers()
#for et in etrs:
#  print(et.address)
#eyetracker = tr.EyeTracker(etrs[0].address)

#Trigger
sock0=socket(AF_INET, SOCK_DGRAM)
sock0.bind(('',5000)) #5000 UDP socket for trigger
def sock0_on_received(msg):
  global gaze_cmd
  val=eval(msg)
  for k in val: gaze_cmd[k]=float(val[k])*0.001
  gaze_cmd["t0"]=time.time()
  gaze_cmd["t1"]=gaze_cmd["tm1"]+gaze_cmd["tm2"]
#  gaze_sample(gaze_cmd)
  dummy_sample(gaze_cmd)
  print("Start broadcast "+str(time.time()))
  result={"time":[],"left":[],"right":[]}
  for d in gaze_data:
    if d["left_gaze_point_validity"]>0 and d["right_gaze_point_validity"]>0:
      result["time"].append(d["time"])
      result["left"].append(d["left_gaze_point_on_display_area"])
      result["right"].append(d["right_gaze_point_on_display_area"])
  result["tm1"]=gaze_cmd["tm1"]
  result["tm2"]=gaze_cmd["tm2"]
  res=re.sub("'",'"',str(result))
  if client2 is not None: sock2.send_message(client2,res)

while True:
  msg, address = sock0.recvfrom(256)
  sock0_on_received(msg)

thread1.join()
thread2.join()