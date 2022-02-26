/**
 * This node is copyright (c) 2017-2021 Peter Scargill. Please consider
 * it free to use for whatever timing purpose you like. If you wish to make
 * changes please note you have the full source when you install BigTimer which
 * essentially is just 2 files (html and js). I maintain BigTimer via 
 * https://tech.scargill.net/big-timer and will look at any code with a view to 
 * incorporating in the main BigTimer. I will not however support or comment on 
 * any unofficial "github repositories". I do not use Github for this as I'd
 * rather encourage people to send code to me to test and release rather than confuse
 * any of the many users of BigTimer with various clones and versions. See version 
 * number in package.json
 *
 * If you find BigTimer REALLY useful - on the blog (right column) is a PAYPAL link to
 * help support the blog and fund my need for new gadgets.
 */

module.exports = function (RED) {
	"use strict";
	var SunCalc = require('suncalc');


	function pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function randomInt(low, high) {
		var m = Math.floor(Math.random() * (Math.abs(high) - low) + low);
		if (high <= 0) return -m; else return m;
	}

	function dayinmonth(date, weekday, n) // date, weekday (1-7) week of the month (1-5)
	{
		if (n > 0) {
			return ((Math.ceil((date.getDate()) / 7) == n) && (date.getDay() == weekday - 1));
		}
		else {
			var last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			return (Math.ceil(last.getDate() / 7) == Math.ceil(date.getDate() / 7) && (date.getDay() == weekday - 1));
		}
	}

	function bigTimerNode(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		var oneMinute = 60000;
		var precision = 0; 

		var onOverride = -1;
		var offOverride = -1;
   
 		var onOffsetOverride = -1; //DJL
		var offOffsetOverride = -1; //DJL
   
    var lonOverride=-1;
    var latOverride=-1;

		var stopped = 0;


		var ismanual = -1;
		var timeout = 0;
		var startDone = 0;

		var onlyManual = 0;

		node.name = n.name;
    node.lat = n.lat;
	  node.lon = n.lon;
		node.offs = n.offs;
		node.startT = n.starttime;
		node.endT = n.endtime;
		node.startT2 = n.starttime2;
		node.endT2 = n.endtime2;
		node.startOff = n.startoff;
		node.endOff = n.endoff;
		node.startOff2 = n.startoff2;
		node.endOff2 = n.endoff2;
		node.outtopic = n.outtopic;
		node.outPayload1 = n.outpayload1;
		node.outPayload2 = n.outpayload2;
		node.outText1 = n.outtext1;
		node.outText2 = n.outtext2;
		node.timeout = n.timeout;
		node.sun = n.sun;
		node.mon = n.mon;
		node.tue = n.tue;
		node.wed = n.wed;
		node.thu = n.thu;
		node.fri = n.fri;
		node.sat = n.sat;
		node.jan = n.jan;
		node.feb = n.feb;
		node.mar = n.mar;
		node.apr = n.apr;
		node.may = n.may;
		node.jun = n.jun;
		node.jul = n.jul;
		node.aug = n.aug;
		node.sep = n.sep;
		node.oct = n.oct;
		node.nov = n.nov;
		node.dec = n.dec;
   
 		node.suspend = n.suspend;
		node.random = n.random;
    node.randon1 = n.randon1;
    node.randoff1 = n.randoff1;
    node.randon2 = n.randon2;
    node.randoff2 = n.randoff2;
    
		node.repeat = n.repeat;
		node.atStart = n.atstart;

		node.odd = n.odd;
		node.even = n.even;

		node.day1 = n.day1;
		node.month1 = n.month1;
		node.day2 = n.day2;
		node.month2 = n.month2;
		node.day3 = n.day3;
		node.month3 = n.month3;
		node.day4 = n.day4;
		node.month4 = n.month4;
		node.day5 = n.day5;
		node.month5 = n.month5;
		node.day6 = n.day6;
		node.month6 = n.month6;
		node.day7 = n.day7;
		node.month7 = n.month7;
		node.day8 = n.day8;
		node.month8 = n.month8;
		node.day9 = n.day9;
		node.month9 = n.month;
		node.day10 = n.day10;
		node.month10 = n.month10;
		node.day11 = n.day11;
		node.month11 = n.month11;
		node.day12 = n.day12;
		node.month12 = n.month12;

		node.xday1 = n.xday1;
		node.xmonth1 = n.xmonth1;
		node.xday2 = n.xday2;
		node.xmonth2 = n.xmonth2;
		node.xday3 = n.xday3;
		node.xmonth3 = n.xmonth3;
		node.xday4 = n.xday4;
		node.xmonth4 = n.xmonth4;
		node.xday5 = n.xday5;
		node.xmonth5 = n.xmonth5;
		node.xday6 = n.xday6;
		node.xmonth6 = n.xmonth6;
		node.xday7 = n.xday7;
		node.xmonth7 = n.xmonth7;
		node.xday8 = n.xday8;
		node.xmonth8 = n.xmonth8;
		node.xday9 = n.xday9;
		node.xmonth9 = n.xmonth9;
		node.xday10 = n.xday10;
		node.xmonth10 = n.xmonth10;
		node.xday11 = n.xday11;
		node.xmonth11 = n.xmonth11;
		node.xday12 = n.xday12;
		node.xmonth12 = n.xmonth12;
  

		node.d1 = n.d1;
		node.w1 = n.w1;
		node.d2 = n.d2;
		node.w2 = n.w2;
		node.d3 = n.d3;
		node.w3 = n.w3;
		node.d4 = n.d4;
		node.w4 = n.w4;
		node.d5 = n.d5;
		node.w5 = n.w5;
		node.d6 = n.d6;
		node.w6 = n.w6;

		node.xd1 = n.xd1;
		node.xw1 = n.xw1;
		node.xd2 = n.xd2;
		node.xw2 = n.xw2;
		node.xd3 = n.xd3;
		node.xw3 = n.xw3;
		node.xd4 = n.xd4;
		node.xw4 = n.xw4;
		node.xd5 = n.xd5;
		node.xw5 = n.xw5;
		node.xd6 = n.xd6;
		node.xw6 = n.xw6;
		// doesn't seem needed - node.xw5 = n.xw5 || 0;

		var goodDay = 0;

		var temporaryManual = 0;
		var permanentManual = 0;

		var playit = 0;
		var newEndTime = 0;

		var actualStartOffset = 0;
		var actualEndOffset = 0;

		var actualStartOffset2 = 0;
		var actualEndOffset2 = 0;
		

		var actualStartTime = 0;
		var actualEndTime = 0;
		var actualStartTime2 = 0;
		var actualEndTime2 = 0;
		
		var manualState = 0;
		var autoState = 0;
		var lastState = -1;
		var actualState = 0;

		var change = 0;


		node
			.on(
			"input",
			function (inmsg) {
      
        if ((lonOverride != -1) &&  (latOverride!=-1)) { node.lon=lonOverride; node.lat=latOverride; } else  { node.lon=n.lon; node.lat=n.lat; }
      
				var now = new Date(); // UTC time - not local time
				// this is the place to add an offset
				now.setHours(now.getHours() + parseInt(node.offs, 10));
				//var nowOff = -now.getTimezoneOffset() * 60000;	// local offset		
				var times = SunCalc.getTimes(now, node.lat, node.lon);	// get this from UTC, not local time
				var moons = SunCalc.getMoonTimes(now, node.lat, node.lon); // moon up and down times - moons.rise, moons.set

				var dawn = (times.dawn.getHours() * 60) + times.dawn.getMinutes();
				var dusk = (times.dusk.getHours() * 60) + times.dusk.getMinutes();

				var solarNoon = (times.solarNoon.getHours() * 60) + times.solarNoon.getMinutes();

				var sunrise = (times.sunrise.getHours() * 60) + times.sunrise.getMinutes();
				var sunset = (times.sunset.getHours() * 60) + times.sunset.getMinutes();

				var date2 = new Date;				
				var date3 = new Date;
				var moonrise;
				var moonset;				
			
				if (typeof moons.rise==='undefined') moonrise=1440; else { date2=moons.rise; moonrise = (date2.getHours() * 60) + date2.getMinutes(); }
				if (typeof moons.set==='undefined') moonset=0; else { date3=moons.set; moonset = (date3.getHours() * 60) + date3.getMinutes(); }
			
	
				var night = (times.night.getHours() * 60) + times.night.getMinutes();
				var nightEnd = (times.nightEnd.getHours() * 60) + times.nightEnd.getMinutes();

				// now=new Date(now+nowOff); // from now on we're working on local time		
				var today = (now.getHours() * 60) + now.getMinutes();
				var startTime = parseInt(node.startT, 10);
				var endTime = parseInt(node.endT, 10);
				var startTime2 = parseInt(node.startT2, 10);
				var endTime2 = parseInt(node.endT2, 10);

				var statusText="";
        
				var outmsg1 = {
					payload: "",
					topic: ""
				};
				var outmsg2 = {
					payload: "",
					reference: node.outtopic + ":" + node.outPayload1 + ":" + node.outPayload2 + ":" + today,
					topic: "status",
					state: "",
					time: "",
					name: ""
				};
				var outmsg3 = {
					payload: "",
					topic: ""
				};


				// autoState is 1 or 0 or would be on auto.... has anything changed...
				change = 0;

				if (actualStartOffset == 0)
				{ if (node.random) actualStartOffset = randomInt(0, node.startOff); else actualStartOffset = node.startOff; 
          if (node.randon1) actualStartOffset = randomInt(0, node.startOff);
        }

				if (actualEndOffset == 0)
				{ if (node.random) actualEndOffset = randomInt(0, node.endOff); else actualEndOffset = node.endOff; 
          if (node.randoff1) actualEndOffset = randomInt(0, node.endOff);
        }

				if (actualStartOffset2 == 0)
				{ if (node.random) actualStartOffset2 = randomInt(0, node.startOff2); else actualStartOffset2 = node.startOff2; 
          if (node.randon2) actualStartOffset2 = randomInt(0, node.startOff2);
        }

				if (actualEndOffset2 == 0)
				{ if (node.random) actualEndOffset2 = randomInt(0, node.endOff2); else actualEndOffset2 = node.endOff2; 
          if (node.randoff2) actualEndOffset2 = randomInt(0, node.endOff2);
        }

			
				// manual override
				if ((inmsg.payload==1) || (inmsg.payload===0)) inmsg.payload=inmsg.payload.toString();
				if (inmsg.payload > "") {
					inmsg.payload=inmsg.payload.toString().replace(/ +(?= )/g,'');
					var theSwitch = inmsg.payload.toLowerCase().split(" ");


					switch (theSwitch[0]) {
                  
            case "geo_override" :  change=1;
            switch (theSwitch.length) {	
							case 3: 
								  lonOverride = Number(theSwitch[1]); latOverride=Number(theSwitch[2]); break;								
							default: lonOverride = -1; latOverride=-1; break;
						}
            break;
                       
            
            
             
						case "sync": goodDay = 1; change = 1; break;
						
						case "toggle" :
										if (actualState==0) 
										{
										if (permanentManual == 0) temporaryManual = 1; 
									    timeout = node.timeout; change = 1; manualState = 1; stopped = 0; goodDay = 1;	
										}
										else
										{
										if (permanentManual == 0) temporaryManual = 1; 
									    timeout = node.timeout; change = 1; manualState = 0; stopped = 0; goodDay = 1;	
										}
									break;
						
						case "on":
						case 1 :
						case "1": 
            
            // bodge to kill timer
            precision=0;
                oneMinute=60000; temporaryManual = 0; 
						    clearInterval(tick);
							  tick = setInterval(function () {
										node.emit("input", {});
									}, oneMinute); // trigger every 60 secs
                 temporaryManual = 1;  
                 
            	if (permanentManual == 0) temporaryManual = 1; 
									timeout = node.timeout; change = 1; manualState = 1; stopped = 0; goodDay = 1; 

                         
							break;                  


						case "off":
						case 0 :
						case "0": 
            // bodge to kill timer
                precision=0;
                oneMinute=60000; temporaryManual = 0; 
						    clearInterval(tick);
							  tick = setInterval(function () {
										node.emit("input", {});
									}, oneMinute); // trigger every 60 secs
            
            	if (permanentManual == 0) temporaryManual = 1; 
									timeout = node.timeout; change = 1; manualState = 0; stopped = 0; goodDay = 1; 

							break;                  
                  


						case "default":
						case "auto": 
            
                        // bodge to kill timer
                precision=0;
                oneMinute=60000; temporaryManual = 0; 
						    clearInterval(tick);
							  tick = setInterval(function () {
										node.emit("input", {});
									}, oneMinute); // trigger every 60 secs
            
            
            temporaryManual = 0; permanentManual = 0; change = 1; stopped = 0; goodDay = 1; precision=0; break;

						case "manual": if ((temporaryManual == 0)) 
							{ 
								manualState = autoState; 
								switch (theSwitch[1]) 
									{
										case 1:
										case "1":
										case "on": manualState=1; break;
										case 0:
										case "0":
										case "off": manualState=0; break;
									} 
							}
							temporaryManual = 0; permanentManual = 1; change = 1; stopped = 0; break;
							
						case "stop": stopped = 1; change = 1; manualState=0; permanentManual=1; break;
            case "quiet":  stopped = 1; change = 0;  break;

						case "on_override": change=1; switch (theSwitch.length) {
							case 1: onOverride = -1; break;
							case 2: var switch2 = theSwitch[1].split(":");
								if (switch2.length==2) onOverride = (Number(switch2[0]) * 60) + Number(switch2[1]); 
								else 
										{
											switch(theSwitch[1])
											{
											case 'dawn' : onOverride=5000; break;	
											case 'dusk' : onOverride=5001; break;	
											case 'solarnoon' : onOverride=5002; break;	
											case 'sunrise' : onOverride=5003; break;	
											case 'sunset' : onOverride=5004; break;	
											case 'night' : onOverride=5005; break;	
											case 'nightend' : onOverride=5006; break;
											case 'moonrise' : onOverride=5007; break;
											case 'moonset'  : onOverride=5008; break;
											default: onOverride = Number(theSwitch[1]); break;
											}
										}
								break;
							case 3: onOverride = (Number(theSwitch[1]) * 60) + Number(theSwitch[2]); break;							
						}
						break;
                   
						case "off_override": change=1; switch (theSwitch.length) {
							case 1: offOverride = -1; break;
							case 2: var switch2 = theSwitch[1].split(":");
								if (switch2.length==2) offOverride = (Number(switch2[0]) * 60) + Number(switch2[1]); 
								else 
										{
											switch(theSwitch[1])
											{
											case 'dawn' : offOverride=5000; break;	
											case 'dusk' : offOverride=5001; break;	
											case 'solarnoon' : offOverride=5002; break;	
											case 'sunrise' : offOverride=5003; break;	
											case 'sunset' : offOverride=5004; break;	
											case 'night' : offOverride=5005; break;	
											case 'nightend' : offOverride=5006; break;
											case 'moonrise' : offOverride=5007; break;
											case 'moonset' : offOverride=5008; break;
											default: offOverride = Number(theSwitch[1]); break;
											}
										}
								break;
							case 3: offOverride = (Number(theSwitch[1]) * 60) + Number(theSwitch[2]); break;
						}
						break;
				    case "on_offset_override": change=1; 
            switch (theSwitch.length) { //DJL this case block
							case 1: onOffsetOverride = -1; break;
							case 2: var switch2 = theSwitch[1].split(":");
								if (switch2.length==2) onOffsetOverride = (Number(switch2[0]) * 60) + Number(switch2[1]); 
								else 
										{
											switch(theSwitch[1])
											{
											case 'dawn' : onOffsetOverride=5000; break;	
											case 'dusk' : onOffsetOverride=5001; break;	
											case 'solarnoon' : onOffsetOverride=5002; break;	
											case 'sunrise' : onOffsetOverride=5003; break;	
											case 'sunset' : onOffsetOverride=5004; break;	
											case 'night' : onOffsetOverride=5005; break;	
											case 'nightend' : onOffsetOverride=5006; break;
											case 'moonrise' : onOffsetOverride=5007; break;
											case 'moonset'  : onOffsetOverride=5008; break;
											default: onOffsetOverride = Number(theSwitch[1]); break;
											}
										}
								break;
							case 3: onOffsetOverride = (Number(theSwitch[1]) * 60) + Number(theSwitch[2]); break;							
						}
						break;
						case "off_offset_override": change=1; 
            switch (theSwitch.length) { //DJL this case block
							case 1: offOffsetOverride = -1; break;
							case 2: var switch2 = theSwitch[1].split(":");
								if (switch2.length==2) offOffsetOverride = (Number(switch2[0]) * 60) + Number(switch2[1]); 
								else 
										{
											switch(theSwitch[1])
											{
											case 'dawn' : offOffsetOverride=5000; break;	
											case 'dusk' : offOffsetOverride=5001; break;	
											case 'solarnoon' : offOffsetOverride=5002; break;	
											case 'sunrise' : offOffsetOverride=5003; break;	
											case 'sunset' : offOffsetOverride=5004; break;	
											case 'night' : offOffsetOverride=5005; break;	
											case 'nightend' : offOffsetOverride=5006; break;
											case 'moonrise' : offOffsetOverride=5007; break;
											case 'moonset' : offOffsetOverride=5008; break;
											default: offOffsetOverride = Number(theSwitch[1]); break;
											}
										}
								break;
							case 3: offOffsetOverride = (Number(theSwitch[1]) * 60) + Number(theSwitch[2]); break;
						}
						break;
						case "timer" :
							precision=Number(theSwitch[1]);
				           if (precision) {
											oneMinute=1000; // dec 2018
											precision++;
											if (theSwitch[2]>"") 
												{ 
													if (theSwitch[2].toLowerCase().substr(0,1)=='m') { oneMinute=60000; precision*=60; }                 													
												}
											if (permanentManual == 0) temporaryManual = 1;
							                 timeout = node.timeout; change = 1; manualState = 1; stopped = 0; goodDay = 1; 
										  } 
						   else { oneMinute=60000; temporaryManual = 0; // permanentManual = 0; // apr 16 2018
						          change = 1; stopped = 0; goodDay = 1; }
						    clearInterval(tick);
							tick = setInterval(function () {
										node.emit("input", {});
									}, oneMinute); // trigger every 60 secs
							break;

						case "timeoff" :
							precision=Number(theSwitch[1]);
				           if (precision) {
											oneMinute=1000; // dec 2018
											precision++;
											if (theSwitch[2]>"") 
												{ 
													if (theSwitch[2].toLowerCase().substr(0,1)=='m') { oneMinute=60000; precision*=60; }                   													
												}
											if (permanentManual == 0) temporaryManual = 1;
							                 timeout = node.timeout; change = 1; manualState = 0; stopped = 0; goodDay = 1; 
										  } 
						   else { oneMinute=60000; temporaryManual = 0; // permanentManual = 0; // apr 16 2018
						          change = 1; stopped = 0; goodDay = 1; }
						    clearInterval(tick);
							tick = setInterval(function () {
										node.emit("input", {});
									}, oneMinute); // trigger every 60 secs
							break;
														
							
							
							
						default: break;
					}
				}

        var thedot="dot"
				if (onOverride != -1) { thedot="ring"; startTime = onOverride; }
				if (offOverride != -1) { thedot="ring"; endTime = offOverride; }
				if (onOffsetOverride != -1) { thedot="ring"; actualStartOffset = onOffsetOverride; } //DJL
				if (offOffsetOverride != -1) { thedot="ring"; actualEndOffset = offOffsetOverride; } //DJL
				

				if (startTime == 5000) startTime = dawn;
				if (startTime == 5001) startTime = dusk;
				if (startTime == 5002) startTime = solarNoon;
				if (startTime == 5003) startTime = sunrise;
				if (startTime == 5004) startTime = sunset;
				if (startTime == 5005) startTime = night;
				if (startTime == 5006) startTime = nightEnd;
				if (startTime == 5007) startTime = moonrise;
				if (startTime == 5008) startTime = moonset;

				if (endTime == 5000) endTime = dawn;
				if (endTime == 5001) endTime = dusk;
				if (endTime == 5002) endTime = solarNoon;
				if (endTime == 5003) endTime = sunrise;
				if (endTime == 5004) endTime = sunset;
				if (endTime == 5005) endTime = night;
				if (endTime == 5006) endTime = nightEnd;				
				if (endTime == 5007) endTime = moonrise;
				if (endTime == 5008) endTime = moonset;

				if (endTime == 10001) endTime = (startTime + 1) % 1440;
				if (endTime == 10002) endTime = (startTime + 2) % 1440;
				if (endTime == 10005) endTime = (startTime + 5) % 1440;
				if (endTime == 10010) endTime = (startTime + 10) % 1440;
				if (endTime == 10015) endTime = (startTime + 15) % 1440;
				if (endTime == 10030) endTime = (startTime + 30) % 1440;
				if (endTime == 10060) endTime = (startTime + 60) % 1440;
				if (endTime == 10090) endTime = (startTime + 90) % 1440;
				if (endTime == 10120) endTime = (startTime + 120) % 1440;

				actualStartTime = (startTime + Number(actualStartOffset)) % 1440;
				actualEndTime = (endTime + Number(actualEndOffset)) % 1440;

				if (startTime2 == 5000) startTime2 = dawn;
				if (startTime2 == 5001) startTime2 = dusk;
				if (startTime2 == 5002) startTime2 = solarNoon;
				if (startTime2 == 5003) startTime2 = sunrise;
				if (startTime2 == 5004) startTime2 = sunset;
				if (startTime2 == 5005) startTime2 = night;
				if (startTime2 == 5006) startTime2 = nightEnd;
				if (startTime2 == 5007) startTime2 = moonrise;
				if (startTime2 == 5008) startTime2 = moonset;

				if (endTime2 == 5000) endTime2 = dawn;
				if (endTime2 == 5001) endTime2 = dusk;
				if (endTime2 == 5002) endTime2 = solarNoon;
				if (endTime2 == 5003) endTime2 = sunrise;
				if (endTime2 == 5004) endTime2 = sunset;
				if (endTime2 == 5005) endTime2 = night;
				if (endTime2 == 5006) endTime2 = nightEnd;
				if (endTime2 == 5007) endTime2 = moonrise;
				if (endTime2 == 5008) endTime2 = moonset;
				
				if (endTime2 == 10001) endTime2 = (startTime2 + 1) % 1440;
				if (endTime2 == 10002) endTime2 = (startTime2 + 2) % 1440;
				if (endTime2 == 10005) endTime2 = (startTime2 + 5) % 1440;
				if (endTime2 == 10010) endTime2 = (startTime2 + 10) % 1440;
				if (endTime2 == 10015) endTime2 = (startTime2 + 15) % 1440;
				if (endTime2 == 10030) endTime2 = (startTime2 + 30) % 1440;
				if (endTime2 == 10060) endTime2 = (startTime2 + 60) % 1440;
				if (endTime2 == 10090) endTime2 = (startTime2 + 90) % 1440;
				if (endTime2 == 10120) endTime2 = (startTime2 + 120) % 1440;

				actualStartTime2 = (startTime2 + Number(actualStartOffset2)) % 1440;
				actualEndTime2 = (endTime2 + Number(actualEndOffset2)) % 1440;
				
				
				autoState = 0; goodDay = 0;
				switch (now.getDay()) {
					case 0:
						if (node.sun)
							autoState = 1;
						break;
					case 1:
						if (node.mon)
							autoState = 1;;
						break;
					case 2:
						if (node.tue)
							autoState = 1;
						break;
					case 3:
						if (node.wed)
							autoState = 1;
						break;
					case 4:
						if (node.thu)
							autoState = 1;
						break;
					case 5:
						if (node.fri)
							autoState = 1;
						break;
					case 6:
						if (node.sat)
							autoState = 1;
						break;
				}

				if (autoState) {
					autoState = 0;
					switch (now.getMonth()) {
						case 0:
							if (node.jan)
								autoState = 1;
							break;
						case 1:
							if (node.feb)
								autoState = 1;
							break;
						case 2:
							if (node.mar)
								autoState = 1;
							break;
						case 3:
							if (node.apr)
								autoState = 1;
							break;
						case 4:
							if (node.may)
								autoState = 1;
							break;
						case 5:
							if (node.jun)
								autoState = 1;
							break;
						case 6:
							if (node.jul)
								autoState = 1;
							break;
						case 7:
							if (node.aug)
								autoState = 1;
							break;
						case 8:
							if (node.sep)
								autoState = 1;
							break;
						case 9:
							if (node.oct)
								autoState = 1;
							break;
						case 10:
							if (node.nov)
								autoState = 1;
							break;
						case 11:
							if (node.dec)
								autoState = 1;
							break;
					}
				}

				if ((node.day1 == now.getDate()) && (node.month1 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day2 == now.getDate()) && (node.month2 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day3 == now.getDate()) && (node.month3 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day4 == now.getDate()) && (node.month4 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day5 == now.getDate()) && (node.month5 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day6 == now.getDate()) && (node.month6 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day7 == now.getDate()) && (node.month7 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day8 == now.getDate()) && (node.month8== (now.getMonth() + 1))) autoState = 1;
				if ((node.day9 == now.getDate()) && (node.month9 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day10 == now.getDate()) && (node.month10 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day11 == now.getDate()) && (node.month11 == (now.getMonth() + 1))) autoState = 1;
				if ((node.day12 == now.getDate()) && (node.month12 == (now.getMonth() + 1))) autoState = 1;

				if (dayinmonth(now, node.d1, node.w1) == true) autoState = 1;
				if (dayinmonth(now, node.d2, node.w2) == true) autoState = 1;
				if (dayinmonth(now, node.d3, node.w3) == true) autoState = 1;
				if (dayinmonth(now, node.d4, node.w4) == true) autoState = 1;
				if (dayinmonth(now, node.d5, node.w5) == true) autoState = 1;

				if ((node.xday1 == now.getDate()) && (node.xmonth1 == (now.getMonth() + 1))) autoState = 0;
				if ((node.xday2 == now.getDate()) && (node.xmonth2 == (now.getMonth() + 1))) autoState = 0;
				if ((node.xday3 == now.getDate()) && (node.xmonth3 == (now.getMonth() + 1))) autoState = 0;
				if ((node.xday4 == now.getDate()) && (node.xmonth4 == (now.getMonth() + 1))) autoState = 0;
				if ((node.xday5 == now.getDate()) && (node.xmonth5 == (now.getMonth() + 1))) autoState = 0;
				if ((node.xday6 == now.getDate()) && (node.xmonth6 == (now.getMonth() + 1))) autoState = 0;
        if ((node.xday7 == now.getDate()) && (node.xmonth7 == (now.getMonth() + 1))) autoState = 1;
				if ((node.xday8 == now.getDate()) && (node.xmonth8 == (now.getMonth() + 1))) autoState = 1;
				if ((node.xday9 == now.getDate()) && (node.xmonth9 == (now.getMonth() + 1))) autoState = 1;
				if ((node.xday10 == now.getDate()) && (node.xmonth10 == (now.getMonth() + 1))) autoState = 1;
				if ((node.xday11 == now.getDate()) && (node.xmonth11 == (now.getMonth() + 1))) autoState = 1;
				if ((node.xday12 == now.getDate()) && (node.xmonth12 == (now.getMonth() + 1))) autoState = 1;

				if (dayinmonth(now, node.xd1, node.xw1) == true) autoState = 0;
				if (dayinmonth(now, node.xd2, node.xw2) == true) autoState = 0;
				if (dayinmonth(now, node.xd3, node.xw3) == true) autoState = 0;
				if (dayinmonth(now, node.xd4, node.xw4) == true) autoState = 0;
				if (dayinmonth(now, node.xd5, node.xw5) == true) autoState = 0;
				if (dayinmonth(now, node.xd6, node.xw6) == true) autoState = 0;

				if (autoState) // have to handle midnight wrap
				{
					var wday;
					wday=now.getDate()&1;
					if ((node.odd)&&wday) autoState=0;
					if ((node.even)&&!wday) autoState=0;
			        if (autoState == 1) goodDay = 1;	
				}

				// if autoState==1 at this point - we are in the right day and right month or in a special day
				// now we check the time

				if (autoState) // have to handle midnight wrap
				{
					autoState = 0;
					if (actualStartTime <= actualEndTime) {
						if ((today >= actualStartTime) && (today < actualEndTime))
							autoState = 1;
					} else // right we are in an overlap situation
					{
						if (((today >= actualStartTime) || (today < actualEndTime)))
							autoState = 1;
					}
					
					// added next line 17/02/2019 - suggestion from Mark McCans to overcome offset issue
					if (node.startT2!=node.endT2)
					{
						if (actualStartTime2 <= actualEndTime2) {
							if ((today >= actualStartTime2) && (today < actualEndTime2))
								autoState = 2;
						} else // right we are in an overlap situation
						{
							if (((today >= actualStartTime2) || (today < actualEndTime2)))
								autoState = 2;
						}
					}	
				}

				if ((node.atStart == 0) && (startDone == 0)) lastState = autoState; // that is - no output at the start if node.atStart is not ticked

				if (autoState != lastState) // there's a change of auto
				{
					lastState = autoState; change = 1;  // make a change happen and kill temporary manual
					if (autoState) { actualEndOffset = 0;  actualEndOffset2 = 0; } else { actualStartOffset = 0; actualStartOffset2 = 0; } // if turning on - reset offset for next OFF time else reset offset for next ON time
					temporaryManual = 0; // kill temporaryManual (but not permanentManual) as we've changed to next auto state
				}


				if (precision) { 
								if (oneMinute==1000) precision--; else { if (precision>=60) precision-=60; }
								if (precision==0) {  clearInterval(tick); oneMinute=60000;
									                 temporaryManual = 0; permanentManual = 0; change = 1; stopped = 0; goodDay = 1;
													 tick = setInterval(function () {
										             node.emit("input", {});
									                 }, oneMinute); // trigger every 60 secs
												 }
						}
				if (temporaryManual || permanentManual) // auto does not time out.
				{
					if (timeout && (permanentManual==0)) {
						if ((--timeout) == 0) {
							manualState = autoState; // turn the output to auto state after X minutes of any kind of manual operation
							temporaryManual = 0; // along with temporary manual setting
							//permanentManual = 0; // april 16 2018
							change = 1;
						}
					}
				}

				if (temporaryManual || permanentManual) actualState = manualState; else actualState = autoState;
				var duration = 0;
				var manov = "";


				if (!goodDay==1) temporaryManual=0; // dec 16 2018
				
				if (permanentManual == 1) manov = " Man. override. "; 
				else if (temporaryManual == 1) 
					{ 
						if (precision) 
						{
							if (precision>=60) 
								manov=" 'Timer' " + parseInt(precision/60) + " mins left. "; 
							else
								manov=" 'Timer' " + precision + " secs left. "; 							
						}
						else manov = " Temp. override. "; 
					}
				if (node.suspend) manov += " - SUSPENDED";

				outmsg2.name = node.name;
				outmsg2.time = 0;

				if (actualState) outmsg2.state = "ON"; else outmsg2.state = "OFF";

				if (stopped == 0) {
					if (temporaryManual) outmsg2.state += " Override";
					else if (permanentManual) outmsg2.state += " Manual";
					else { if (goodDay == 1) outmsg2.state += " Auto"; }
				}
				else outmsg2.state += " Stopped";
    

				
				if ((permanentManual == 1) || (temporaryManual == 1) || (node.suspend)) {   // so manual then
					if (actualState) {
						if (stopped == 0)
							{ statusText = "ON" + manov;
               node.status({
								fill: "green",
								shape: thedot,
								text: statusText
							}); }
						else
							{
              statusText = "STOPPED" + manov;
              node.status({   // stopped completely
								fill: "black",
								shape: thedot,
								text: statusText
							});
             }
					}
					else {
						if (stopped == 0)
							{
              statusText = "OFF" + manov;
              node.status({
								fill: "red",
								shape: thedot,
								text: statusText
							});
             }
						else
              {
              statusText = "STOPPED" + manov; 
							node.status({   // stopped completely
								fill: "black",
								shape: thedot,
								text: statusText
							});
              }
					}
				}
				else // so not manual but auto....
				{
					if (goodDay == 1)  // auto and today's the day
					{ 
						if (actualState) {  // i.e. if turning on automatically
							if (actualState==1)
						 	{
								if (today <= actualEndTime)
									duration = actualEndTime - today;
								else
									duration = actualEndTime + (1440 - today);
							}	
							if (actualState==2)
						 	{
								if (today <= actualEndTime2)
									duration = actualEndTime2 - today;
								else
									duration = actualEndTime2 + (1440 - today);
							}					
							
							outmsg2.time = pad(parseInt(duration / 60), 2) + "hrs " + pad(duration % 60, 2) + "mins";
							if (stopped == 0)
								{
                statusText = "On for " + pad(parseInt(duration / 60), 2) + "hrs " + pad(duration % 60, 2) + "mins" + manov;
                node.status({
									fill: "green",
									shape: thedot,
									text: statusText
								});
                }
							else
								{
                statusText = "STOPPED" + manov;
                node.status({   // stopped completely
									fill: "black",
									shape: thedot,
									text: statusText
								});
                }
						}
						else {
								if ((node.startT2!=node.endT2)&&(today>actualEndTime) && (today<actualEndTime2)) // valid start and end 2 and we're past period 1
								{
									if ((today <= actualStartTime2))
										duration = actualStartTime2 - today;
									else
										duration = actualStartTime2 + (1440 - today);
								}
								else
								{
									if (today <= actualStartTime)
										duration = actualStartTime - today;
									else
										duration = actualStartTime + (1440 - today);
								}
							
							outmsg2.time = pad(parseInt(duration / 60), 2) + "hrs " + pad(duration % 60, 2) + "mins" + manov;
							if (stopped == 0)
								{
                statusText = "Off for " + pad(parseInt(duration / 60), 2) + "hrs " + pad(duration % 60, 2) + "mins" + manov;
                node.status({
									fill: "blue",
									shape: thedot,
									text: statusText
								});
                }
							else
							{
               statusText = "STOPPED" + manov;
              	node.status({   // stopped completely
									fill: "black",
									shape: thedot,
									text: statusText
								});
              }
						}
					}
					else {
						outmsg2.time = "";
						if (stopped == 0)
						{
             statusText = "No action today" + manov;
            	node.status({   // auto and nothing today thanks
								fill: "black",
								shape: thedot,
								text: statusText
							});
             }
						else
							{
              statusText = "STOPPED" + manov;
              node.status({   // stopped completely
								fill: "black",
								shape: thedot,
								text: statusText
							});
             }
					}
				}

        outmsg2.lon=node.lon;
        outmsg2.lat=node.lat;

				outmsg1.topic = node.outtopic;
				outmsg3.payload = node.outText1;
				outmsg3.topic = node.outtopic;

				if (temporaryManual || permanentManual) outmsg1.state = (actualState) ? "on" : "off"; else outmsg1.state = "auto";
				outmsg1.value = actualState;

				if (actualState) {
					outmsg1.payload = node.outPayload1;
					outmsg3.payload = node.outText1;
				}
				else {
					outmsg1.payload = node.outPayload2;
					outmsg3.payload = node.outText2;
				}

				// take into account CHANGE variable - if true a manual or auto change is due

				outmsg1.autoState = autoState;
				outmsg1.manualState = manualState;
				outmsg1.timeout = timeout;
				outmsg1.temporaryManual = temporaryManual;
				outmsg1.permanentManual = permanentManual;
				outmsg1.now = today;
				outmsg1.timer = precision;
				outmsg1.duration = duration;
				outmsg1.stamp = Date.now();
        outmsg1.extState=statusText;

				outmsg2.payload = outmsg1.value;
				outmsg2.start = actualStartTime;
				outmsg2.end = actualEndTime;
				outmsg2.dusk = dusk;
				outmsg2.dawn = dawn;
				outmsg2.solarNoon = solarNoon;
				outmsg2.sunrise = sunrise;
				outmsg2.sunset = sunset;
				outmsg2.night = night;
				outmsg2.nightEnd = nightEnd;
				outmsg2.moonrise = moonrise;
				outmsg2.moonset = moonset;
				outmsg2.now = today;
				outmsg2.timer = precision;
				outmsg2.duration = duration;
				outmsg2.onOverride = onOverride;
				outmsg2.offOverride = offOverride;
				outmsg2.onOffsetOverride = onOffsetOverride;
				outmsg2.offOffsetOverride = offOffsetOverride;
				outmsg2.stamp = Date.now();
        outmsg2.extState=statusText;
				

					if ((!node.suspend) && ((goodDay) || (permanentManual))) {
					if ((change) || ((node.atStart) && (startDone == 0))) {
						if (outmsg1.payload > "") {
							if (stopped == 0) { if (change) node.send([outmsg1, outmsg2, outmsg3]); else node.send([null, outmsg2, outmsg3]); } else { if (change) node.send([outmsg1, outmsg2, null]); else node.send([null, outmsg2, null]); }
						}
						else {
							if (stopped == 0) node.send([null, outmsg2, outmsg3]); else node.send([null, outmsg2, null]);
						}
					}
					else {
						if (outmsg1.payload > "") {
							if (node.repeat)
							{ if (stopped == 0) node.send([outmsg1, outmsg2, null]); else node.send([null, outmsg2, null]); }
							else
							{ if (stopped == 0) node.send([null, outmsg2, null]); else node.send([null, outmsg2, null]); }

						}
						else {
							if (node.repeat) node.send([null, outmsg2, null]);
						}
					}
				}
				startDone = 1;
			});  // end of the internal function

		var tock = setTimeout(function () {
			node.emit("input", {});
		}, 2000); // wait 2 secs before starting to let things settle down -
		// e.g. UI connect

		var tick = setInterval(function () {
			node.emit("input", {});
		}, oneMinute); // trigger every 60 secs

		node.on("close", function () {
			if (tock) {
				clearTimeout(tock);
			}
			if (tick) {
				clearInterval(tick);
			}
		});

	}
	RED.nodes.registerType("bigtimer", bigTimerNode);
}
