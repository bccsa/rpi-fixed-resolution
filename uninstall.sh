#!/bin/bash

systemctl stop rpi-fixed-resolution.service
systemctl disable rpi-fixed-resolution.service

rm -rf "/lib/systemd/system/rpi-fixed-resolution.service"

systemctl daemon-reload

echo "Service removed"