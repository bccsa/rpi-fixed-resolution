#!/bin/bash

serviceFile=/lib/systemd/system/rpi-fixed-resolution.service
scriptDir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

configFile="$1"   # Reference to configuration file is passed as first argument

serviceConfig="[Unit]
Description=Raspberry Pi Fixed Resolution
After=network.target

[Service]
WorkingDirectory=$scriptDir
ExecStart=node $scriptDir/index.js $configFile
Restart=always

[Install]
WantedBy=multi-user.target"

existingConfig=$(cat $serviceFile)

# Check if the service file changed
changed=false
diff=$(diff -N <(echo $existingConfig) <(echo $serviceConfig))
if [ "$diff" != "" ] && [ "$diff" != "\n" ]
then
    echo "$serviceConfig" > $serviceFile
    changed=true
fi

# Check if the service is not running or the service file changed
if [ "$(systemctl is-active rpi-fixed-resolution.service)" != "active" ] || [ "$changed" == "true" ]
then
    # Create directory for configuration file
    mkdir -p $(dirname $configFile)

    # Enable and restart the service
    systemctl daemon-reload
    systemctl enable rpi-fixed-resolution.service
    systemctl restart rpi-fixed-resolution.service
fi

echo "Service installed"