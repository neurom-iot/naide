module.exports = function(RED) {
    function Code_Viewer(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var funcText =  "var node = __node__\n" +
                        n.codeText;
        //
        const vm = require('vm');
        const spawn = require('child_process').spawn;
        var pythonProcess;
        var callPython = function(callback, path, arg) {
            pythonProcess = spawn('python', ["nodes/" + path, arg]);
            pythonProcess.stdout.on('data', function(data) {
                callback(Buffer.from(data, 'utf-8').toString());
            });
        }
        const sandbox = {
            console: console,
            RED: {
                util: RED.util
            },
            Buffer: Buffer,
            Date: Date,
            __node__ : {
                id: node.id,
                name: node.name,
                send: function(msg) {
                    node.send(msg);
                }
            },
            callPython: callPython
        };
        
        var context = vm.createContext(sandbox);
        try {
            
            node.on('input', function(msg) {
                context.msg = msg;
                vm.runInContext(funcText, context)
            });
        }
        catch (err) {
            if ((typeof err === "object") && err.hasOwnProperty("stack")) {
                //remove unwanted part
                var index = err.stack.search(/\n\s*at ContextifyScript.Script.runInContext/);
                err.stack = err.stack.slice(0, index).split('\n').slice(0,-1).join('\n');
                var stack = err.stack.split(/\r?\n/);

                //store the error in msg to be used in flows
                msg.error = err;

                var line = 0;
                var errorMessage;
                if (stack.length > 0) {
                    while (line < stack.length && stack[line].indexOf("ReferenceError") !== 0) {
                        line++;
                    }

                    if (line < stack.length) {
                        errorMessage = stack[line];
                        var m = /:(\d+):(\d+)$/.exec(stack[line+1]);
                        if (m) {
                            var lineno = Number(m[1])-1;
                            var cha = m[2];
                            errorMessage += " (line "+lineno+", col "+cha+")";
                        }
                    }
                }
                if (!errorMessage) {
                    errorMessage = err.toString();
                }
                done(errorMessage);
            }
            else if (typeof err === "string") {
                done(err);
            }
            else {
                done(JSON.stringify(err));
            }
        }
    }
    RED.nodes.registerType("code_viewer", Code_Viewer);
}