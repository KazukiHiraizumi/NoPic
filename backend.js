#!/usr/bin/env node

'use strict';
const ws=require('./cawserver.js').listen(5000);
const serialport=require('serialport');

const comm=new serialport('com40',{
	baudRate:19200,
	dataBits:8,
	parity:'none',
	stopBits:1,
	flowControl:false
},
function(err){
	if(err!=null){
		console.log('Serialport error:'+err);
		process.exit(1);
	}
});

let commBuf=new Uint8Array();
let commWdt=100;
let commWid=0;
comm.on('open',function(){
	console.log('[serialport message]Open');
});
comm.on('close',function(){
	console.log('[serialport message]Closed');
	ws._client.sendObject({'com':false});
});
comm.on('data',function(data){
	if(commWid!=0) clearTimeout(commWid);
	var a=new Uint8Array(commBuf.byteLength+data.byteLength);
	a.set(commBuf);
	a.set(data,commBuf.byteLength);
	commBuf=a;
	commWid=setTimeout(function(){
		psp_parse(commBuf);
		commBuf=new Uint8Array();
		commWdt=100;
		setImmediate(psp_pull);
	},commWdt);
});


let psp_wbuf=new Array(); //write queue

ws.reload=function(){
	var dat=new Uint8Array(2);
	dat[0]=0x20;//cmd
	dat[1]=0x00;//address
	comm.write(dat);
}
ws.queue=function(dat){
	psp_wbuf.push(dat);
}
ws.write=function(){
	psp_pull();
}
function psp_parse(dat){
	switch(dat[0]&0xf0){
	case 0x20:
	case 0xe0:
		switch(dat[1]){
		case 0://--------------rom dump
			ws._client.sendObject({'rom':dat.subarray(2)});
			break;
		case 1://--------------diagnostic
		case 2:
			ws._client.sendObject({'diag':dat.subarray(2)});
			break;
		default://--------------graph data
			let chan=dat[2];
			let sz=(dat.length-3)/3;
			let t1=new Int16Array(sz);
			let w1=new Int16Array(sz);
			let w2=new Int16Array(sz);
			let w3=new Int16Array(sz);
			for(let i=0,p=3,ts=0;i<sz;i++,p+=3){
				let dt=dat[p]/8192.0;//------dt
				t1[i]=Math.floor(ts*1000);
				w1[i]=Math.floor(3.14/dt);//--------angular velocity as radian/sec
				w2[i]=(dat[1]&1)? dat[p+1]:(dat[p+1]<128? dat[p+1]:dat[p+1]-256)
				w3[i]=dat[p+2]
				ts+=dt;
			}
			ws._client.sendObject({
				'graph':{
					'x':'['+t1.toString()+']',
					'y1':'['+w1.toString()+']',
					'y2':'['+w2.toString()+']',
					'y3':'['+w3.toString()+']'
				}
			});
			break;
		}
		break;
	case 0x50:
	case 0x90:
		ws._client.sendObject({'ram':{'address':dat[1],'value':dat[2]}});
		break;
	default:
		console.log('[PSP error]'+dat[0]);
	}
}

function psp_pull(){
	if(psp_wbuf.length>0){
		let q=psp_wbuf.shift();
		var dat=new Uint8Array(3);
		dat[0]=0x50|((q.address>>8)&0xf);
		dat[1]=q.address&0xff;
		dat[2]=q.value;
		commWdt=10;
		comm.write(dat);
	}
}
