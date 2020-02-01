var pnow=require("performance-now");
var busy=false;
var halt=false;
var schld;
var ws;
var pub;
var glfw;
var text2array;
var deg2gl;
var glQuantize;

module.exports={
	run:run,
	abort:abort,
	init:function(libs,input,output){
		glfw=libs.glfw;
		text2array=libs.text2array;
		deg2gl=libs.deg2gl;
		glQuantize=libs.glQuantize;
		ws=input;
		pub=output;
	},
	busy:busy
}

function run(){
	switch(pub.tpc_runlevel){
	case 0:
		if(glfw==null) return;
		if(arguments.length==0) return;
		schld=text2array(ws.prm_mkcpd);
		pub.tpc_runcount=0;
		pub.tpc_runlevel=1;
//the first frame
	case 1:
		if(schld.length==0){
			pub.tpc_runlevel=99;
			setTimeout(run,1);
			return;
		}
		pub.tpc_runcount++;
		pub.tpc_cpd=ws.prm_cpd;
		pub.tpc_mkcpd=Number(schld.shift());
		pub.tpc_tm2=ws.prm_tm2;
		if(pub.tpc_mkcpd<0){
			pub.tpc_cpd=-pub.tpc_cpd;
			pub.tpc_mkcpd=-pub.tpc_mkcpd;
		}
		pub.tpc_lamda=deg2gl(1/pub.tpc_cpd);
		if(ws.prm_hzuni=='hz') pub.tpc_dph=ws.prm_hz/ws.prm_fps;
		else pub.tpc_dph=deg2gl(ws.prm_hz)/Math.abs(pub.tpc_lamda)/ws.prm_fps;
		if(ws.prm_quan){
			pub.tpc_lamda=glQuantize(pub.tpc_lamda);
			pub.tpc_dph=glQuantize(pub.tpc_lamda*pub.tpc_dph)/pub.tpc_lamda;
		}
		pub.tpc_phase=0;
		glfw.stdin.write('W '+pub.tpc_lamda+' 0 '+ws.prm_greyp+' '+ws.prm_greyn+' '+ws.prm_bin+';');
		glfw.stdin.write('B '+ws.prm_blwid+' '+ws.prm_bg+';');
		glfw.stdin.write('C 0 0 '+deg2gl(pub.tpc_mkcpd*0.5)+' '+ws.prm_mkcol+'\n');
//console.log('W '+pub.tpc_lamda+' 0 '+ws.prm_greyp+' '+ws.prm_greyn+';');
		pub.tpc_wait=ws.prm_tm1;
		if(pub.tpc_wait>0) setTimeout(run,pub.tpc_wait);
		ws.notif(pub);
		pub.tpc_runlevel=2;
		return;
//the 2nd and following frames
	case 2:
		pub.tpc_diag=1; //start GL process diagnostic
		pub.tpc_ext=6000+pub.tpc_runcount;  //UDP
		var tp=pnow()+Number(ws.prm_tm2);
		for(var f=Math.floor(ws.prm_tm2*ws.prm_fps/1000);f>0;f--){
			pub.tpc_phase+=pub.tpc_dph;
			glfw.stdin.write('W '+pub.tpc_lamda+' '+pub.tpc_phase+' '+ws.prm_greyp+' '+ws.prm_greyn+' '+ws.prm_bin+';');
			glfw.stdin.write('B '+ws.prm_blwid+' '+ws.prm_bg+';');
			glfw.stdin.write('C 0 0 '+deg2gl(pub.tpc_mkcpd*0.5)+' '+ws.prm_mkcol+'\n');
		}
		pub.tpc_wait=Math.ceil(tp-pnow());
		if(pub.tpc_wait>0){
			setTimeout(run,pub.tpc_wait);
		}
		ws.notif(pub);
		pub.tpc_runlevel=3;
		return;
	case 3:
		pub.tpc_diag=0; //stop GL process diagnostic
		pub.tpc_wait=ws.prm_tm3;
		if(pub.tpc_wait>0){
			setTimeout(run,pub.tpc_wait);
			glfw.stdin.write('B 1 '+ws.prm_bg+'\n');
		}
		ws.notif(pub)
		pub.tpc_runlevel=1;
		return;
	case 99: //request to terminate
		pub.tpc_runlevel=pub.tpc_wait=0;
		ws.notif(pub);
		glfw.stdin.write('B 1 '+ws.prm_bg+'\n');
		pub.tpc_runcount=pub.tpc_cpd=pub.tpc_mkcpd=pub.tpc_tm2=0;
		busy=false;
		return;
	}
}

function abort(){
	busy=halt=false;
}

