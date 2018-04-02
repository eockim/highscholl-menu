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
    console.log("onRead-micro1", socket.remoteAddress, socket.remotePort, data);

    business.requestMenu((response, socket) =>{

      console.log('response', response);

    });
  }

  onClose(socket){
    console.log('onClose-micro1");')
  }

}

new micro();
