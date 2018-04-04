var map = {};
const config = require('config').get('distributor');

class distributor extends require("./tcp-server.js"){
  constructor(){
    super(config.serviceName, config.port, config.urls);
  }

  onCreate(socket){
    console.log("onCreate-distributor", socket.remoteAddress, socket.remotePort);
    this.sendInfo(socket);
  }

  onClose(socket){
    var key = socket.remoteAddress + ":" + socket.remotePort;
    console.log("onClose-distributor", socket.remoteAddress, socket.remotePort);
    delete map[key];

    this.sendInfo();
  }

  onRead(socket, json) {
    var key = socket.remoteAddress + ":" + socket.remotePort;
    console.log("onRead-distributor", socket.remoteAddress, socket.remotePort);

    if(json.uri == "/distributes" && json.method == "POST") {

        map[key] = {
            socket : socket
        };
        map[key].info = json.params;
        map[key].info.host = socket.remoteAddress;

        this.sendInfo();
    }
  }

  write(socket, packet){
    socket.write(JSON.stringify(packet) + '¶');
  }

  sendInfo(socket){
    var packet = {
      uri: "/distributes",
      method: "GET",
      key: 0,
      params: []
    }

    for(var i in map){
      packet.params.push(map[i].info);
    }

    if(socket){
      this.write(socket, packet);
    }else{
      for(var i in map){
        this.write(map[i].socket, packet);
      }
    }
  }
}

new distributor();
