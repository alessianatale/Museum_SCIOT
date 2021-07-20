var mqtt = require('mqtt');
var url = require("url");

var mqtt_url = url.parse(
    process.env.CLOUDAMQP_MQTT_URL ||
    "mqtt://guest:guest@192.168.1.4:1883"
);
var auth = (mqtt_url.auth || ":").split(":");
var url = "mqtt://" + mqtt_url.host;
var options = {
  port: mqtt_url.port,
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: auth[0],
  password: auth[1],
};

var client = mqtt.connect(url, options);

client.on('connect', function() {
  console.log("Connection Successful");
  console.log("Let's see the humidity rate:");
  client.subscribe('iot/logs');
});

var content = "";
client.on('message', function(topic, message) {
  content += message.toString() + "<br>";
  console.log(message.toString());

});

