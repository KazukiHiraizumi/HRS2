//File Menu UI
var FileMan=function(ws){
//Required UI parts
	var evptr=this;
	$('#FMload').click(function(e){
		evptr.loadEv(e,ws);
	});
	$('#FMload').html('&nabla;');
	$('#FMsave').click(function(e){
		evptr.saveEv(e,ws);
	});
	$('#FMsave').html('&nabla;');
	$('#FMremove').click(function(e){
		evptr.removeEv(e,ws);
	});
	$('#FMremove').html('&nabla;');
	this.seled=false;
}

FileMan.prototype={
	dir:'.',
	sel:function(obj){
		obj.html('X');
		this.seled=true;
	},
	unsel:function(obj){
		$('#FMload_pm').empty();
		$('#FMsave_pm').empty();
		$('#FMremove_pm').empty();
		obj.html('&nabla;');
		this.seled=false;
	},
	unselall:function(){
		$('#FMload_pm').empty();
		$('#FMsave_pm').empty();
		$('#FMremove_pm').empty();
		$('#FMload').html('&nabla;');
		$('#FMsave').html('&nabla;');
		$('#FMremove').html('&nabla;');
		this.seled=false;
	},
	reflect:function(obj){
		var ret={};
		for(var prop in obj){
			if(typeof obj[prop]==='function') continue;
			var target=$('#'+prop);
			if(target.length==0) continue;
			console.log('reflect:'+prop+'='+obj[prop]);
			if(target.attr('type')=='checkbox') target.prop('checked',ret[prop]=obj[prop]);
			else target.val(ret[prop]=obj[prop]);
		}
		console.log('reflect:'+JSON.stringify(ret));
	},
	collect:function(obj){
		var ret={};
		for(var prop in obj){
			if(typeof obj[prop]==='function') continue;
			var target=$('#'+prop);
			if(target.length==0) continue;
			if(target.attr('type')=='checkbox') ret[prop]=obj[prop]=target.prop('checked');
			else ret[prop]=obj[prop]=target.val();
		}
		console.log('collect:'+JSON.stringify(ret));
		return ret;
	},
	loadEv:function(e,ws){
		var target=$(e.target);
		if(this.check(target)) return;
		var evptr=this;
		this.json_ls(function(list){
			evptr.sel(target);
			for(var i=0;i<list.length;i++){
				$('#FMload_pm').append('<div><a href="#">'+list[i]+'</a></div>');
			}
			$('#FMload_pm a').click(function(e){
				evptr.json_load($(e.target).text(),function(data){
					ws.send(data);
					ws.set(data);
					evptr.reflect(data);
				});
				evptr.unsel(target);
			});
		});
	},
	saveEv:function(e,ws){
		var target=$(e.target);
		if(this.check(target)) return;
		var evptr=this;
		var ovrwrt=true;
		this.json_ls(function(list){
			evptr.sel(target);
			$('#FMsave_pm').html('<div><input style="width:75%;"></input><button>&radic;</button></div>');
			var obj=evptr.collect(ws);
			$('#FMsave_pm input').val(obj['name']);
			$('#FMsave_pm input').focus();
			$('#FMsave_pm input').css('color','red');
			$('#FMsave_pm button').click(function(){
				if(ovrwrt && !confirm('ファイルを上書きします')) return;
				var nam=$('#FMsave_pm input').val();
				if(nam!=''){
					obj['name']=ws['name']=nam;
					evptr.reflect({'name':nam});
					evptr.json_save(nam,obj,function(msg){
						evptr.unsel(target);
					});
				}
			});
			$('#FMsave_pm input').keyup(function(){
				if(list.indexOf($('#FMsave_pm input').val())<0){
					$('#FMsave_pm input').css('color','black');
					ovrwrt=false;
				}
				else{
					$('#FMsave_pm input').css('color','red');
					ovrwrt=true;
				}
			});
			$('#FMsave_pm input').keypress(function(event){
				if(event.which==13){
					if(ovrwrt && !confirm('ファイルを上書きします')) return;
					var nam=$('#FMsave_pm input').val();
					if(nam!=''){
						obj['name']=ws['name']=nam;
						evptr.reflect({'name':nam});
						evptr.json_save(nam,obj,function(msg){
							evptr.unsel(target);
						});
					}
				}
			});
		});
	},
	removeEv:function(e,ws){
		var target=$(e.target);
		if(this.check(target)) return;
		var evptr=this;
		this.json_ls(function(list){
			evptr.sel(target);
			for(var i=0;i<list.length;i++){
				if($('#name').val()!=list[i]) $('#FMremove_pm').append('<div><a href="#">'+list[i]+'</a></div>');
			}
			$('#FMremove_pm a').click(function(e){
				let fn=$(e.target).text();
				if(confirm('! ファイル '+fn+' を削除します')){
					evptr.json_rm($(e.target).text(),function(){
						$(e.target).remove();
						if($('#FMremove_pm a').length==0) evptr.unsel(target);
					});
				}
			});
			if($('#FMremove_pm a').length==0){
				evptr.unsel(target);
			}
		});
	},
	check:function(obj){
		if(obj.html()=='X'){
			this.unsel(obj);
			return true;
		}
		else{
			this.unselall();
			return false;
		}
	},
//I/O for JSON file
	json_ls:function(listf){
		var obj=this;
		var arg=arguments;
		XHRget('json-ls.sh?'+this.dir).then(function(response){
			console.log("json-ls ok:", response);
			var ary=JSON.parse(response);
			listf(ary);
		}, function(error) {
			console.log("json-ls retry:", error);			
			obj.json_ls.apply(obj,arg);
		});
	},
	json_save:function(name,data,savef){
		var obj=this;
		var arg=arguments;
		XHRget('json-save.sh?'+this.dir+'/'+name+JSON.stringify(data)).then(function(response){
			console.log("json-save ok:", response);
			if(arg.length>=3){
				savef(response);
			}
		}, function(error) {
			console.log("json-save retry:", error);
			obj.json_save.apply(obj,arg);
		});
	},
	json_rm:function(name,removef){
		var obj=this;
		var arg=arguments;
		XHRget('json-rm.sh?'+this.dir+'/'+name).then(function(response){
			console.log("json-rm ok:", response);
			if(arg.length>=2){
				removef(response);
			}
		}, function(error) {
			console.log("json-rm error:", error);
//			obj.json_rm.apply(obj,arg);
			if(arg.length>=2){
				removef(error);
			}
		});
	},
	json_load:function(name,loadf,errf){
		var obj=this;
		var arg=arguments;
		XHRget('json-load.sh?'+this.dir+'/'+name).then(function(response){
			if(response.length>0){
				console.log("json-load ok:", response);
				var data=JSON.parse(response);
				loadf(data);
				if(!((typeof obj.loaded)==='undefined')) obj.loaded();
			}
			else{
				console.log("json-load error 405:"+name);
				if(arg.length>=3) errf('Error 405');
			}
		},function(error) {
			obj.json_ls(function(list){
				if(list.length==0 || list.indexOf(name)<0){
					console.log("json-load error 404:"+name);
					if(arg.length>=3) errf('Error 404');
				}
				else{
					console.log("json-load retry");
					obj.json_load.apply(obj,arg);
				}
			});
		});
	}
}
