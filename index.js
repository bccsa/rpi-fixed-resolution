const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { EventEmitter } = require('events');

const event = new EventEmitter();

// Default config
var conf = {
    resolution: "1280x720",
    refreshRate: 50,
    position: "0x0",            // display position
    interval: 10000,            // check interval in milliseconds
    user: 'pi',                 // Logged in user
}

// Read configuration file from passed argument(s)
if (process.argv.length > 2) {
    load(process.argv[2]);
} else {
    load('config.json');
}

// Load config and start cycle
function load(path) {
    loadConfig(path).then(data => {
        Object.keys(conf).forEach(k => {
            if (typeof data[k] == 'string') {
                conf[k] = data[k];
            }
        });

        startCycle(conf);
    }).catch(err => {
        console.error(`Error reading configuration file ${path}}: ${err}`);

        if (!path) {
            path = 'config.json'
        }

        console.log(`Saving default configuration to ${path}`);
        saveConfig(path, conf);

        startCycle(conf);
    });
}

// Load config from file
function loadConfig(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                try {
                    let c = JSON.parse(data);
                    resolve(c);
                }
                catch (err) {
                    reject(err);
                }
            }
        });
    });
}

// Save config to file
function saveConfig(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

// monitors list of connected displays, and fires an 'connected' event when a display is connected
var xrandrState = {};
// var hdmiSoundEnabled = false;
function xrandrMonitor(conf) {
    let cmd = `DISPLAY=:0 xrandr | grep HDMI`
    exec(cmd, { shell: true }).then(output => {
        if (typeof output.stdout == 'string') {
            output.stdout.split('\n').forEach(line => {
                let display = line.match(/HDMI-[1-2]/gmi);
                let state = line.match(/(dis)?connected/gmi);

                if (Array.isArray(display) && display.length > 0) {
                    display = display[0];
                }

                if (Array.isArray(state) && state.length > 0) {
                    state = state[0];
                }

                if (display && state) {
                    // If an HDMI display is connected on first run, set hdmiSoundEnabled to true to prevent running the sound configuration twice
                    // if (state == 'connected' && !xrandrState[display]) {
                    //     hdmiSoundEnabled = true;
                    // }

                    // Fire event if state changes to connected
                    if (state == 'connected' && state != xrandrState[display]) {
                        event.emit('connect', display);
                    }

                    xrandrState[display] = state;
                }
            });
        }
    }).catch(err => { });
}

// Listen for the monitor 'connect' event
event.on('connect', display => {
    // Set resolution and refresh rate
    let cmd1 = `DISPLAY=:0 xrandr --output ${display} --mode ${conf.resolution} --rate ${conf.refreshRate} --pos ${conf.position}`;
    exec(cmd1, { shell: true }).catch(err => { });

    // Set sound output
    // ref1 https://forums.raspberrypi.com/viewtopic.php?t=343523
    // ref2 https://unix.stackexchange.com/questions/65246/change-pulseaudio-input-output-from-shell
    let cmd2 = `
        DISPLAY=:0 systemctl --user stop pulseaudio.service
        DISPLAY=:0 systemctl --user stop pulseaudio.socket
        DISPLAY=:0 pulseaudio --start
        DISPLAY=:0 pacmd set-default-sink 1`;
    // if (!hdmiSoundEnabled) {
    //     cmd2 = `
    //         systemctl --user stop pulseaudio.service
    //         systemctl --user stop pulseaudio.socket
    //         pulseaudio --start
    //         pacmd set-default-sink 1`;
    //     hdmiSoundEnabled = true;
    // } else {
    //     cmd2 = `pacmd set-default-sink 1`;
    // }
    exec(cmd2, { shell: true }).catch(err => { });
});

// Start interval timer
function startCycle(conf) {
    // first run
    xrandrMonitor(conf);

    // Subsequent runs
    setInterval(() => { xrandrMonitor(conf) }, conf.interval);
}
