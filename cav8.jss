#!/usr/bin/env node

const WebSocket=require('ws');
const ws=new WebSocket.Server({ port:5000 });
ws.on('connection',function(client){
	console.log("New connection");
	client.on('message',function(msg){
		console.log('received: %s', msg);
		var obj=JSON.parse(msg);
		ws.set(obj);
	});
	client.on("close",function(){
		console.log("Client closed");
	});
	client.on("error",function(){
		console.log("Client error");
	});
});
ws.on('error',function(){
	console.log("WS error");
});
Object.assign(ws,{
	closeCB:null,
	notif:function(obj){
		var msg=JSON.stringify(arguments.length>0? obj:this);
		this.clients.forEach(function(target){
			try{
				target.send(msg);
			}
			catch(err){
				console.log('CASV:notif error');
			}
		});
	},
	set:function(obj){
		for(var key in obj){
			var val=obj[key];
			if((typeof this[key])==='undefined'){
				console.log('CASV:set undefined, so make it:'+key);
				this[key]=val;
			}
			else if((typeof this[key])==='function'){
				console.log('CASV:set.call:'+key+'='+val);
				this[key](val);
			}
			else{
				console.log('CASV:set.val:'+key+'='+val);
				this[key]=val;
			}
		}
	}
});

///////////////////////////////////////////////////////////////////////////////
//Application Specific Codes are below
///////////////////////////////////////////////////////////////////////////////
var os = require('os');
var dgram = require('dgram');
var net = require( 'net' );
var pnow=require("performance-now");

var pub={
	tpc_runcount:0,
	tpc_runlevel:0,
	tpc_cpd:0,
	tpc_mkcpd:0,
	tpc_tm2:0,
	tpc_tbf:0,
	tpc_tbfmax:0,
	tpc_lamda:0,
	tpc_phase:0,
	tpc_dph:0,
	tpc_wait:0,
	tpc_ext:null,
	tpc_diag:0,
};

var net=require( 'net' );
var glfw=new net.Socket();
glfw.connect( 8888, 'localhost', function(){
  console.log( '接続: ');
});
glfw.on('data',function(data){
	pub.tpc_tbf=Number(data);
	switch(pub.tpc_diag){
	case 1:
		pub.tpc_tbfmax=0;
		pub.tpc_diag=2;
		break;
	case 2:
		if(pub.tpc_tbfmax<pub.tpc_tbf) pub.tpc_tbfmax=pub.tpc_tbf;
		break;
	}
	if(pub.tpc_ext==null) return;
	var str=new Buffer([pub.tpc_ext>>24,pub.tpc_ext>>16,pub.tpc_ext>>8,pub.tpc_ext]);
	var len=str.length;
//	var uint=new Uint8Array(len);
//	for(var i=0;i<len;i++) uint[i]=str.charCodeAt(i);
	var dn=ws.prm_eturl.split(':');
	var url=dn[0];
	var port=dn.length>1? dn[1]:3000;
	var sock=dgram.createSocket('udp4');
	sock.send(str,0,len,port,url,function(err,bytes){
//		console.log('dgram send');
		if(err) console.log('UDP error ');
		else sock.close();
	});
	pub.tpc_ext=null;
//	console.log('GL:stdout:'+data);
});
glfw.on('close',function(){
	console.log('GL:close:');
	glfw=null;
});

var libs={
	glfw:glfw,
	text2array:function(s0){
		var s1=s0.split(os.EOL);
		var ar=new Array();
		for(var i=0;i<s1.length;i++){
			if(s1[i]=='') continue;
			var s2=s1[i].trim().split(' ');
			var s3=s2[0].trim();
			if(s3=='') continue;
			ar.push(s3);
		}
		return ar;
	},
	deg2gl:function(deg){
		return 4*ws.prm_scndist*Math.tan(Math.PI*deg/360)/ws.prm_scnwid;
	},
	glQuantize:function(gl){
		var r=Math.ceil(ws.prm_resol*gl/2);
		console.log('Quantize:'+r);
		return 2*r/ws.prm_resol;
	}
}

program=[
	require('./prog1.js'),
	require('./prog2.js'),
	require('./prog3.js')
];
program.forEach(function(prg){ prg.init(libs,ws,pub);});

Object.assign(ws,{
	prm_fps:60,prm_scndist:700,prm_scnwid:500,prm_resol:1920,prm_bg:0,prm_greyp:1,prm_greyn:0,prm_bin:false,prm_quan:false,prm_tm1:500,prm_tm2:100,prm_tm3:3000,prm_hz:10,prm_hzuni:'hz',prm_cpd:"1",prm_calcpd:3,prm_calcol:1,prm_mkcpd:1,prm_mkcol:1,prm_blwid:0.1,
	prm_eturl:'localhost:3000',
	srv_abort:function(){
		console.log('abort');
		program.forEach(function(prg){
			prg.abort();
		});
		if(pub.tpc_wait==0){
			pub.tpc_runlevel=0;
			this.srv_clear();
			this.notif(pub);
		}
		else pub.tpc_runlevel=99;
	},
//	closeCB:function(){ this.srv_abort();},
	srv_clear:function(){
		glfw.write('B 1 '+ws.prm_bg+'\n');
	},
	srv_run1:function(){
		if(pub.tpc_wait==0) program[0].run(true);
	},
	srv_run2:function(){
		if(pub.tpc_wait==0) program[1].run(true);
	},
	srv_run3:function(){
		if(pub.tpc_wait==0) program[2].run(true);
	},
	srv_runCalib:function(n){
		pub.tpc_ext=4001+Number(n);
		glfw.write('B 1 '+ws.prm_bg+';');
		var rad=libs.deg2gl(ws.prm_calcpd)/2;
		var cx=libs.deg2gl(ws.prm_caldx);
		var cy=libs.deg2gl(ws.prm_caldy);
		var x=(Math.floor(n%3)-1)*cx;
		var y=(1-Math.floor(n/3))*cy;
		glfw.write('C '+x+' '+y+' '+rad+' '+ws.prm_calcol+'\n');
	},
	srv_glwrt:function(){
		console.log('GLWRT:');
		if(glfw!=null){
			glfw.write('W 0.1 '+pnow()/1000+' 0 1\n');
		}
	},
	srv_glrun:function(){
//		glfw.write('L title.obj 0.5\n');
//		glfw.write('R -90 1 0 0\n');
//		setTimeout(function(){
//			for(var i=0;i<100;i++){
//				glfw.write('R '+(-90+90*i/100)+' 1 0 0\n');
//			}
//		},1000);
	}
});

setTimeout(ws.srv_glrun,1000);
