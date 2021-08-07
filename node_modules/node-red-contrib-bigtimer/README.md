# The ultimate Timing node for Node-Red

## Purpose
**BigTimer** is the best Node-Red timing node offering a range of timing facilities. BigTimers can be used singly or in groups. Full support for dusk/sunset dawn/sunrise and variations also day/week/month (and special days) control. The node offers outputs suitable for MQTT, speech and databases. You can also manually over-ride the UTC time setting on the host computer if required.

## Usage
Suitable for general use and very powerful, BigTimer has 3 outputs, the first of which triggers when there is a change of state and presents one of two messages (for, for example, MQTT or other control mechanism), the second output has a topic of "status" and contains a simple 1 or 0 every minute in the payload and also has additional outputs reflecting the status message in msg.state and message time and others. The third output presents a message which could be used for speech or debugging. 

## Inputs
BigTimer also has an input. This can be used to override the schedule - valid commands in the payload are "on" (or 1), "off" (or 0) which override until the next change of automatic schedule state, "manual" which when used with "on" and "off" changes the state until the timeout times out (nominally 1440 minutes or 24 hours), "default" (or "auto") which scraps manual settings and goes back to auto, "stop" which stops the timer working completely (as does the "suspend" tickbox), without the affecting current outputs and "sync" which outputs the current state immediately without changing anything.

The command list for manual injection is as follows:

	-sync                - simply force an output
	-on or 1             - turn the output on (reverts next schedule change)
	-off or 0            - turn the output off (reverts next schedule change)
	-toggle              - Manual toggle - no matter which mode (auto or manual) will toggle the output (see on and off)
	-default or auto     - return to auto state
	-manual              - When using (1/0) to override output, this will stop reversion at schedule change)
	-stop                - stop the scheduler - set the output off
	-on_override         - manually override the on time (in minutes or hours and minutes - space separated i.e. inject "on_override 20:00" or just "on_override" to cancel)
	-off_override        - manually override the off time (in minutes or hours and minutes - space separated i.e. inject "off_override 21:00" or just "off_override" to cancel)
	-timer X [s m]       - Manual seconds timer sets the output on for X seconds (or minutes)
	-timeoff X (as above)
	-geo_override         - Example "geo_override" (no quotes) clears the longitude and latitude override and reverts back to those you set manually in BigTimer panel, whereas "geo_override 37.7 -2.53" sets a location in southern Spain - values from Google maps. 
 
Use a just-after-startup INJECT node to insert values for example from a global variable. 
.
Note that **on_override** and **off_override** settings will be lost if Node-Red is stopped and restarted or if the board/computer is rebooted.
Check also **on_offset_override** and **off_offset_override**

## Special Days
These include special days (i.e. 25/12) and special weekdays (i.e. first Tuesday of the month) and as of v2.0.0 these can be included or excluded.
You can if you wish (from v2.3.0 onwards) for example merely turn on BigTimer one day every month of the year by turning off ALL months and using any of the 12 special days.
For those occasions where "alternative days" are required there are checkbox options to BAN output on even and/or odd days of the month.

## General
Note - if upgrading to a later version of BigTimer - check your settings. More information on BigTimer, my other nodes and a range of home-control-related projects can be found at [the tech blog](https://tech.scargill.net).

From v2.0.7.  BigTimer output #1 features the following: (for example using GPIO12 on ESP8266 and ESP-GO - here we are in auto mode but have added a manual "timer" command for a short override)

	-payload: {out12:1}
	-topic: sonoff4/toesp
	-state: "on"
	-value: 1
	-autostate: 1
	-manualstate: 1
	-timeout: 1439
	-temporaryManual: 1
	-permanentManual:0
	-now: 669
	-timer: 600
	-duration:0
	-timer_left: 10
	-stamp: 1544959025262

The second BigTimer output (v1.55 onwards) now outputs a range of values every minute (in minutes past the beginning of the day) including sunrise and sunset. 

Example:

	-payload: 0
	-reference: "sonoff02/toesp:{out12:1}:{out12:0}:1287"
	-topic: "status"
	-state: "OFF Not-today"
	-time: ""
	-timer: 0
	-name: "Office Green Light Timer"
	-start: 1395
	-end: 1425
	-dusk: 1108
	-dawn: 372
	-solarNoon: 740
	-sunrise: 407
	-sunset: 1073
	-night: 1190
	-nightEnd: 290
	-now: 1287
	-timer: 600
	-duration: 0
	-timer_left: 10
	-onOverride: -1
	-offOverride: -1
	-stamp: 1544959537232

Time values above are in minutes past the beginning of the day.

You can typically access these in a Node-Red function as msg.payload, msg.reference etc. See the [tech blog bigtimer entry](https://tech.scargill.net/big-timer) for more info.

Typical use for the override - set the **on** time manually to 6:15pm i.e. "on_override 18:15" in msg.payload to the input simply use **on_override -1** to return to normal time settings - when in override the normal status dot below the node will turn into a ring.
