const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

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

// xrandr screen configuration
function xrandr(conf) {
    let cmd = `sudo -u ${conf.user} DISPLAY=:0 xrandr --output HDMI-1 --mode ${conf.resolution} --rate ${conf.refreshRate} --pos ${conf.position};
               sudo -u ${conf.user} DISPLAY=:0 xrandr --output HDMI-2 --mode ${conf.resolution} --rate ${conf.refreshRate} --pos ${conf.position};`;

    exec(cmd, { shell: true }).then(output => {

    }).catch(err => {});
}

// Start interval timer
function startCycle(conf) {
    // first run
    xrandr(conf);

    // Subsequent runs
    setInterval(() => { xrandr(conf) }, conf.interval);
}
