# rpi-fixed-resolution
Process to force a fixed screen resolution for Raspberry Pi OS Bullseye.

rpi-fixed-resolution forces the display resolution, refresh rate and position to the values configured in the configuration file. The sound output is automatically set to the first connected HDMI display.

## Prerequisites
* nodejs
* xrandr

## Configuration
The configuration file path is passed to the NodeJS script as a parameter. If no parameter is passed the default path is used. If no configuration file exists, the script will attempt to write its default configuration to the passed / default configuration file.