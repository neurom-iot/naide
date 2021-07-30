module.exports = function(RED) {
    function SNN_Lowbirth_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', ["na-components/snn-lowbirth/python/nengo_lowbirth_imp.py", msg.payload, msg.answer.toString()]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(msg, Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (msg, data) => {
            console.log(data);
            if (data.includes("sim:")) {
                parse = data.replace('sim:', '').replace('\r\n', '').toString();
                msg.payload = JSON.parse(parse);
            }
            else {
                msg.payload = data;
            }
            //msg.payload = data;
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            callPython(msg);
        });
        
    }
    RED.nodes.registerType("snn-lowbirth-implement", SNN_Lowbirth_Implement);
}