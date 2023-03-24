# rpi-fixed-resolution
SystemD service to force a fixed screen resolution for Raspberry Pi OS Bullseye.

rpi-fixed-resolution forces the display resolution, refresh rate and position to the values configured in the configuration file.

## Prerequisites
* nodejs
* xrandr

## Installation & updates
Installing or updating the SystemD service:
```shell
sudo ./install.sh /path/to/configuration/file.json
```
Uninstalling the SystemD service:
```shell
sudo ./uninstall.sh
```

## Configuration
An default configuration file (/etc/rpi-fixed-resolution) is automatically generated on first run. Note that the default configuration will probably not work as a valid username needs to be configured under which the xrandr command will run (logged in user).