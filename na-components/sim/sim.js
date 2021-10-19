module.exports = function(RED) {
    //https://nodered.org/docs/user-guide/writing-functions
    
    var stack = [];
    var busy = false;
    var settings = RED.settings;
    var util = require("util");
    var events = require("events");
    var path = require("path");
    var debuglength = RED.settings.debugMaxLength || 1000;
    util.inspect.styles.boolean = "red";

    const fs = require('fs');

    function makeFile(msg) {
        console.log("!@!@#!@#!", msg);
        sim_result = msg.sim_result;
        // npy, npz, hdf5
        console.log(sim_result);

    }

    function sendDebug(msg) {
        makeFile(msg.msg);
        msg = RED.util.encodeObject(msg,{maxLength:debuglength});
        RED.comms.publish("sim-message",msg);
    }

    function SimComponent(n) {
        var hasEditExpression = (n.targetType === "jsonata");
        var editExpression = hasEditExpression ? n.complete : null;
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.complete = "true";
        if (this.complete === "false") { this.complete = "payload"; }
        this.console = ""+(n.console || false);
        this.tostatus = (this.complete !== "true") && (n.tostatus || false);
        this.tosidebar = n.tosidebar;
        if (this.tosidebar === undefined) { this.tosidebar = true; }
        this.severity = n.severity || 40;
        this.active = (n.active === null || typeof n.active === "undefined") || n.active;
        if (this.tostatus) { this.status({fill:"grey", shape:"ring"}); }
        else { this.status({}); }

        var node = this;
        var levels = { //customLevels Option
            off: 1,
            fatal: 10,
            error: 20,
            warn: 30,
            info: 40,
            debug: 50,
            trace: 60,
            audit: 98,
            metric: 99
        };
        var colors = {
            "0": "grey",
            "10": "grey",
            "20": "red",
            "30": "yellow",
            "40": "grey",
            "50": "green",
            "60": "blue"
        };
        var preparedEditExpression = null;
        if (editExpression) {
            try {
                preparedEditExpression = RED.util.prepareJSONataExpression(editExpression, this);
            }
            catch (e) {
                node.error(RED._("debug.invalid-exp", {error: editExpression}));
                return;
            }
        }
      
        function prepareValue(msg, done) {
            // Either apply the jsonata expression or...
            if (preparedEditExpression) {
                RED.util.evaluateJSONataExpression(preparedEditExpression, msg, (err, value) => {
                    if (err) {
                        done(RED._("debug.invalid-exp", {error: editExpression}));
                    } else {
                        done(null,{id:node.id, z:node.z, name:node.name, topic:msg.topic, msg:value, _path:msg._path});
                    }
                });
            } else {
                // Extract the required message property
                var property = "payload";
                var output = msg[property];
                if (node.complete !== "false" && typeof node.complete !== "undefined") {
                    property = node.complete;
                    try {
                        output = RED.util.getMessageProperty(msg,node.complete);
                    } catch(err) {
                        output = undefined;
                    }
                }
                done(null,{id:node.id, z:node.z, name:node.name, topic:msg.topic, property:property, msg:output, _path:msg._path});
            }
        }


        var context=this.context;
        

        //object (topic + msg + payload)
        this.on('input', function(msg, send, done){
            if(typeof(msg.payload) === "undefined" || typeof(msg.sim_result.sim) === "undefined"){
                return;
            }
            else{
                if (this.complete === "true") {
                    // debug complete msg object
                    if (this.console === "true") {
                        node.log("\n"+util.inspect(msg, {colors:useColors, depth:10}));
                    }
                    if (this.active && this.tosidebar) {
                        sendDebug({id:node.id, z:node.z, name:node.name, topic:msg.topic, msg:msg, _path:msg._path});
                    }
                    done();
                } else {
                    prepareValue(msg,function(err,debugMsg) {
                        if (err) {
                            node.error(err);
                            return;
                        }
                        var output = debugMsg.msg;
                        if (node.console === "true") {
                            if (typeof output === "string") {
                                node.log((output.indexOf("\n") !== -1 ? "\n" : "") + output);
                            } else if (typeof output === "object") {
                                node.log("\n"+util.inspect(output, {colors:useColors, depth:10}));
                            } else {
                                node.log(util.inspect(output, {colors:useColors}));
                            }
                        }
                        if (node.tostatus === true) {
                            var st = (typeof output === 'string')?output:util.inspect(output);
                            var severity = node.severity;
                            if (st.length > 32) { st = st.substr(0,32) + "..."; }
                            node.status({fill:colors[severity], shape:"dot", text:st});
                        }
                        if (node.active) {
                            if (node.tosidebar == true) {
                                sendDebug(debugMsg);
                            }
                        }
                        done();
                    });
                }
            }
     });
    }

    RED.nodes.registerType("sim", SimComponent);

    // As debug/view/debug-utils.js is loaded via <script> tag, it won't get
    // the auth header attached. So do not use RED.auth.needsPermission here.
    RED.httpAdmin.get("/naide/sim/*",function(req,res) {
        var options = {
            root: __dirname + '/simulator/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options);
    });
    
    RED.httpAdmin.get("/naide/download/sim/*", function(req, res) {
        var filename = req.params[0]
        res.download(__dirname + "/python/" + filename);
    })

    RED.httpAdmin.post("/naide/makefile/sim/*",function(req,res) {
        var ftype = req.params[0]
        var data = req.body.sim_data;
        let spawn = require('child_process').spawn;
        switch(ftype) {
            case "npz":
            case "npy":
            case "h5":
                let str = JSON.stringify(data);
                let pythonProcess = spawn('python', ['na-components/sim/python/makefile.py', ftype, str])
                pythonProcess.stdout.on('data', function(data) {
                    let buff = Buffer.from(data, 'utf-8').toString();
                    res.json({res: buff});
                });     
                break;
            default:
                res.json({res: false, err: "unknown file type"});
                break;
        };
    });

    RED.httpAdmin.get("/naide/download/sim",function(req,res) {
        var options = {
            root: __dirname + '/simulator/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options);
    });
};

