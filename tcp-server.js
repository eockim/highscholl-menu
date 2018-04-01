'user strict';

const net = require('net');
const tcpClient = require('./tcp-client.js');
const config = require('config').get('distributor');

class tcpServer{
  constructor(name, port, urls){
    this.context = {
      port: port,
      name: name,
      urls: urls
    }
    this.merge = {};

    this.server = net.createServer((socket) => {

        this.onCreate(socket);

        socket.on('error', (exception) =>{
          this.onClose(socket);
        });

        socket.on('close', () =>{
          this.onClose(socket);
        });

        socket.on('data', (data) => {
                var key = socket.remoteAddress + ":" + socket.remotePort;
                var sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();
                var arr = sz.split('¶');
                for (var n in arr) {
                    if (sz.charAt(sz.length - 1) != '¶' && n == arr.length - 1) {
                        this.merge[key] = arr[n];
                        break;
                    } else if (arr[n] == "") {
                        break;
                    } else {
                        this.onRead(socket, JSON.parse(arr[n]));
                    }
                }
        });
    });

    this.server.on('error', (err) =>{
      console.log(err);
    });

    this.server.listen(port, () =>{
      console.log('listen..', this.server.address());
    });

  }

  // onCreate(socket){
  //   console.log('onCreate', socket.remoteAddress, socket.remotePort);
  // }
  //
  // onClose(socket){
  //   console.log('onClose', socket.remoteAddress, socket.remotePort);
  // }

  connectToDistributor(host, port, onNoti) {

    var packet = {
      uri: "/distributes",
      method: "POST",
      key: 0,
      params: this.context
    };
    var isConnectedDistributor = false;

    this.clientDistributor = new tcpClient(
      host,
      port,
      (options) => {                                    // onCreate
        isConnectedDistributor = true;
        this.clientDistributor.write(packet);
      },
      (options, data) => { onNoti(data); }, //onRead
      (options) => { isConnectedDistributor = false; }, //onEnd
      (options) => { isConnectedDistributor = false; }  // onClose
    );

    setInterval(() => {
        if (isConnectedDistributor != true) {
            this.clientDistributor.connect();
        }
    }, config.interval);
  }
}

module.exports = tcpServer;
