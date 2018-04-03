'use strict';
var config = require('config');
var business =require('./service/guro.js');
const connect = config.get('micro1.connect');

class micro extends require('./tcp-server.js'){

  constructor(){

    super(connect.serviceName, process.argv[2] ? Number(process.argv[2]) : connect.port, connect.urls);

    this.connectToDistributor("127.0.0.1", 9001, (data) => {
      console.log("Distributor Notification", data);
    });
  }

  onRead(socket, data){

    console.log("onRead-micro1", socket.remoteAddress, socket.remotePort);

    business.requestMenu(data.params, (packet) =>{

      socket.write(JSON.stringify(packet) + '¶');

    } );
    //socket.write('{"errorcode":0,"errormessage":"success","key":0,"data":{"date":"2018.04.03","type":"중식","menu":"혼합곡밥,육개장,수제피자치킨커틀렛,매콤두부참치조림,오이..","kal":"1608 kcal"}}' + '¶');
  };
}

new micro();
