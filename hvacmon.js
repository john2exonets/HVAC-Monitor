//
//  hvacmon.js  --  monitor HTC Thermostats and publish temp readings via MQTT
//
//  John D. Allen
//  March, 2020
//

var HoneywellTotalComfort = require('./lib/honeywelltc.js');
var config = require('./config/config.json');
var mqtt = require('mqtt');

var DEBUG = config.debug;

// MQTT connection options
var copts = {
  clientId: "hvacmon",
  keepalive: 5000
};
var topics = [
  'hvac/heat/on',
  'hvac/cool/on'
];

var opts = {
  "User": config.username,
  "Passwd": config.password,
  "DEBUG": config.debug
}

//---------------------------------------------------------------------------
// MQTT Stuff
//---------------------------------------------------------------------------
var client = mqtt.connect(config.mqttBroker, copts);

client.on("connect", function() {
  client.subscribe(topics);
});

client.on('message', function(topic, message) {
  var out = topic + ": " + message.toString();
  if (DEBUG > 8) { console.log(Date() + ":" + out); }

  // Check for bad data
  if (message.indexOf("nan") > 0) {
    if (DEBUG > 8) { console.log(">> BAD DATA"); }
    return false;
  }

  var tt = topic.split('/');
  if (tt[1] == "heat") {
    turnAllHeatON();
  }
  if (tt[1] == "cool") {
    turnAllCoolON();
  }

});

//---------------------------------------------------------------------------
// Honeywell TC Stuff
//---------------------------------------------------------------------------
var htc = new HoneywellTotalComfort(opts);
var cntCool = {};
var cntHeat = {};
config.devices.forEach((n) => {
  cntCool[n.id] = 0;
  cntHeat[n.id] = 0;
});

function pubDevicesStatus() {
  config.devices.forEach((n) => {
    htc.chkDataSession(n.id).then((rr) => {
      // console.log("----------------------------");
      // console.log("Name: " + n.name)
      // console.log("Temp = " + rr.latestData.uiData.DispTemperature);
      var topic = config.baseTopic + n.name;
      var out = '{"unit":"' + n.name +'", "temp":';
      out += rr.latestData.uiData.DispTemperature.toString() + ', "mode":';
      switch (rr.latestData.uiData.SystemSwitchPosition) {
        case 1:  // HEAT
          //
          //  Auto-Cool Feature
          if (rr.latestData.uiData.DispTemperature >= config.startCool) {
            cntCool[n.id]++;
            if (cntCool[n.id] == 3) {  // if after three times in a row...
              if (DEBUG > 8) { console.log(">>Auto-Cool turned on for unit " + n.name); }
              cntCool[n.id] = 0;
              turnCoolON(n.id);
              out += '"cool", ';
            } else {
              out += '"heat", ';
            }
          } else {
            cntCool[n.id] = 0;
            out += '"heat", ';
          }
          break;
        case 2:  // OFF
          out += '"off", ';
          break;
        case 3:  //  COOL
          //
          //  Auto-Heat Feature
          if (rr.latestData.uiData.DispTemperature <= config.startHeat) {
            cntHeat[n.id]++;
            if (cntHeat[n.id] == 3) {   // if after three times in a row...
              if (DEBUG > 8) { console.log(">>Auto-Heat turned on for unit " + n.name); }
              cntHeat[n.id] = 0;
              turnHeatON(n.id);
              out += '"heat", ';
            } else {
              out += '"cool", ';
            }
          } else {
            cntHeat[n.id] = 0;
            out += '"cool", ';
          }
          break;
        case 4:  //  AUTO
          out += '"auto", ';
          break;
        default:  //  UNKNOWN
          out += '"---", ';
      }
      out += '"fan":';
      if (rr.latestData.fanData.fanIsRunning) {
        out += '"on" }';
        if (DEBUG > 8) { console.log(out); }
        client.publish(topic, out);
        // console.log("Fan is Running");
      } else {
        out += '"off" }';
        if (DEBUG > 8) { console.log(out); }
        client.publish(topic, out);
        // console.log("Fan is Not Running");
      }

    }).catch((err) => {
      console.log(err);
    });
  });

  setTimeout(pubDevicesStatus, config.period);     // publish every x minutes
}

function turnHeatON(devId) {
  config.devices.forEach((n) => {
    if (n.id == devId) {
      htc.setDeviceMode(n.id, htc.HEAT).then((out) => {
        if (out.success == 1) {
          if (DEBUG > 5) { console.log("Changes were successful."); }
        } else {
          console.log("setDeviceMode(): Failed");
          if (DEBUG > 5) { console.log(JSON.stringify(out)); }
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  });
}

function turnCoolON(devId) {
  config.devices.forEach((n) => {
    if (n.id == devId) {
      htc.setDeviceMode(n.id, htc.COOL).then((out) => {
        if (out.success == 1) {
          if (DEBUG > 5) { console.log("Changes were successful."); }
        } else {
          console.log("setDeviceMode(): Failed");
          if (DEBUG > 5) { console.log(JSON.stringify(out)); }
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  });
}

function turnAllHeatON() {
  config.devices.forEach((n) => {
    htc.setDeviceMode(n.id, htc.HEAT).then((out) => {
      if (out.success == 1) {
        if (DEBUG > 5) { console.log("Changes were successful."); }
      } else {
        console.log("setDeviceMode(): Failed");
        if (DEBUG > 5) { console.log(JSON.stringify(out)); }
      }
    }).catch((err) => {
      console.log(err);
    });
  });
}

function turnAllCoolON() {
  config.devices.forEach((n) => {
    htc.setDeviceMode(n.id, htc.COOL).then((out) => {
      if (out.success == 1) {
        if (DEBUG > 5) { console.log("Changes were successful."); }
      } else {
        console.log("setDeviceMode(): Failed");
        if (DEBUG > 5) { console.log(JSON.stringify(out)); }
      }
    }).catch((err) => {
      console.log(err);
    });
  });
}

//----------------------------------------------------------------------------
// MAIN
//----------------------------------------------------------------------------
pubDevicesStatus();
