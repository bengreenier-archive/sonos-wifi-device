var ds = require('device-status');
var sonos = require('sonos');
var first = true;
var active = false;
var activeTimeout = null;
var sonosStatus = false;

var deviceIp = process.argv[2];

console.log("using "+deviceIp+" as device ip");

// get the state of sonos
findSonos(function (device) {
    device.getCurrentState(function (err, state) {
        if (!err) {
            sonosStatus = state === "playing" ? true : false;
            console.log("looks like sonos is currently"+(sonosStatus ? "" : " not")+" playing");
        }
    });
});

// mount device stuff
ds(deviceIp).on("change", function (host, status) {
    if (first) {
        console.log("first result, ignoring...");
        first = false;
        return;
    }
    if (status) {
        console.log("device found");
        active = true;
        clearTimeout(activeTimeout);
        if (!sonosStatus) {
            findSonos(function (device) {
                device.play(function (err) {
                    if (!err) {
                        console.log("playing.");
                    }
                });
            });
        }
    } else {
        if (activeTimeout == null) {
            activeTimeout = setTimeout(function () {
                active = false;
                console.log("device inactive for 10 minutes");
                if (sonosStatus) {
                    findSonos(function (device) {
                        device.pause(function (err) {
                            if (!err) {
                                console.log("paused.");
                            }
                        });
                    });
                }
            }, 10 * 60 * 1000);
            console.log("timeout set");
        }
    }
});

//helper to get the `main` sonos instance
function findSonos(cb) {
    sonos.search(function(device) {
        // device is an instance of sonos.Sonos
        device.currentTrack(function (err, track) {
            // we determine the device to use by which device
            // has a track.title property
            if (!err && typeof(track.title) !== "undefined") {
                cb(device);
            }
        });
    });
}