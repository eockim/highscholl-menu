var redis = require("redis"),
    client = redis.createClient(6379,'redis1');

    client.on("error", function (err) {
        console.log("Error " + err);
    });

    client.get("today", (err, reply) =>{
      console.log('err', err);
      console.log('reply', reply);
    })

    client.quit();

    module.exports = client;
