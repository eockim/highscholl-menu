'use strict';
var config = require('config');
var business =require('./service/guro.js');
const connect = config.get('micro1.connect');
const cluster = require('cluster');
const elastic = require('./elastic.js').connect;
const numCPU = require('os').cpus().length;

class micro extends require('./tcp-server.js'){

  constructor(){

    super(connect.serviceName, process.argv[2] ? Number(process.argv[2]) : connect.port, connect.urls);

    this.connectToDistributor("127.0.0.1", 9001, (data) => {

        console.log("Distributor Notification");

    });
  }

  onRead(socket, data){

    console.log("onRead-micro1", socket.remoteAddress, socket.remotePort);

    business.requestMenu(data.params, (packet) =>{

      socket.write(JSON.stringify(packet) + '¶');

    });
  };
}

if(cluster.isMaster){

  console.log('Master ${process.pid} is running');
  for (let i = 0; i < numCPU; i++) {                   
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {       
    console.log('worker ${worker.process.pid} died');
    // elastic.index({
    //   index: 'microservice',                          // index
    //   type: 'logs',                                   // type
    //   body: 'body-1234'
    // });
    cluster.fork();
  });
}else{

  new micro();
}
new micro();
