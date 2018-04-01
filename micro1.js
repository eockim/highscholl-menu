'use strict';

class micro extends require('./tcp-server.js'){

  constructor(){

    super("micro", process.argv[2] ? Number(process.argv[2]) : 9010, ["POST/micro", "POST/micro22"]);

    this.connectToDistributor("127.0.0.1", 9001, (data) => {
      console.log("Distributor Notification", data);
    });
  }

  onRead(socket, data){
    console.log("onRead-micro1", socket.remoteAddress, socket.remotePort, data);
  }

}

new micro();
