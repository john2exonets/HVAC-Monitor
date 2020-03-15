//
//  hvacmon.js  --  monitor HTC Thermostats and publish temp readings via MQTT
//
//  John D. Allen
//  March, 2020
//

var HoneywellTotalComfort = require('./lib/honeywelltc.js');
var config = require('./config/config.json');
var mqtt = require('mqtt');

const BROKER = "http://10.1.1.28";
const BASETOPIC = "temp/read/hvac/";
var DEBUG = true;

// MQTT connection options
var copts = {
  clientId: "hvacmon",
  keepalive: 5000
};

var opts = {
  "User": config.username,
  "Passwd": config.password,
  "DEBUG": config.debug
}

//---------------------------------------------------------------------------
// MQTT Stuff
//---------------------------------------------------------------------------
var client = mqtt.connect(BROKER, copts);

client.on("connect", function() {
  // ** Do Nothing; Here in case we want to monitor the MQTT bus.
});

//---------------------------------------------------------------------------
// Honeywell TC Stuff
//---------------------------------------------------------------------------
var htc = new HoneywellTotalComfort(opts);

function pubDevicesStatus() {
  config.devices.forEach((n) => {
    htc.chkDataSession(n.id).then((rr) => {
      // console.log("----------------------------");
      // console.log("Name: " + n.name)
      // console.log("Temp = " + rr.latestData.uiData.DispTemperature);
      var topic = BASETOPIC + n.name;
      var out = '{"unit":"' + n.name +'", "temp":';
      out += rr.latestData.uiData.DispTemperature.toString() + ', "mode":';
      switch (rr.latestData.uiData.SystemSwitchPosition) {
        case 1:
          out += '"heat", ';
          break;
        case 2:
          out += '"off", ';
          break;
        case 3:
          out += '"cool", ';
          break;
        case 4:
          out += '"auto", ';
          break;
        default:
          out += '"---", ';
      }
      out += '"fan":';
      if (rr.latestData.fanData.fanIsRunning) {
        out += '"on" }';
        if (DEBUG) { console.log(out); }
        client.publish(topic, out);
        // console.log("Fan is Running");
      } else {
        out += '"off" }';
        if (DEBUG) { console.log(out); }
        client.publish(topic, out);
        // console.log("Fan is Not Running");
      }

    }).catch((err) => {
      console.log(err);
    });
  });

  setTimeout(pubDevicesStatus, config.period);     // publish every x minutes
}

//----------------------------------------------------------------------------
// MAIN
//----------------------------------------------------------------------------
pubDevicesStatus();
