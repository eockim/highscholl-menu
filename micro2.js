'use strict';
var config = require('config');
const connect = config.get('micro2.connect');

class micro extends require('./tcp-server.js'){

  constructor(){

    super(connect.serviceName, process.argv[2] ? Number(process.argv[2]) : connect.port, connect.urls);

    this.connectToDistributor("127.0.0.1", 9001, (data) => {
      console.log("Distributor Notification");
    });
  }

  onRead(socket, data){
    console.log("onRead-micro2", socket.remoteAddress, socket.remotePort);

    // business.requestMenu((response, socket) =>{
    //
    //   console.log('response', response);
    //
    // });
  }

  onClose(){
    console.log('onClose-micro2");')
  }

}

new micro();
