#!/usr/bin/env node

'use strict';
const ws=require('./cawserver.js').listen(5000);
const serialport=require('serialport');
const Canvas=require('canvas');

const comm=new serialport('/dev/ttyUSB0',{
	baudRate:19200,
	dataBits:8,
	parity:'none',
	stopBits:1,
	flowControl:false
});
var commBuf=new Uint8Array();
var commWdt=100;
var commWid=0;
comm.on('open',function(){
	console.log('comm opened');
});
comm.on('data',function(data){
	if(commWid!=0) clearTimeout(commWid);
	var a=new Uint8Array(commBuf.byteLength+data.byteLength);
	a.set(commBuf);
	a.set(data,commBuf.byteLength);
	commBuf=a;
	commWid=setTimeout(function(){
		console.log('Rx:'+commBuf);
		psp_parse(commBuf);
		commBuf=new Uint8Array();
		commWdt=100;
		setImmediate(psp_pull);
	},commWdt);
});


var psp_wbuf=new Array(); //write queue

ws.reload=function(){
	console.log('ws.reload');
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
		console.log('client send:'+dat.byteLength);
		switch(dat[1]){
		case 0:
			ws._client.sendObject({'rom':dat.subarray(2)});
			break;
		case 16:
		case 17:
			break;
		}
		break;
	case 0x50:
	case 0x90:
		ws._client.sendObject({'ram':{'address':dat[1],'value':dat[2]}});
		break;
	default:
		console.log('psp:'+dat[0]);
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
