module.exports = function(RED) {
    function SNN_IRIS_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', ["na-components/snn-iris/python/nengo_iris_imp.py", msg.payload.toString()]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(msg, Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (msg, data) => {
            if (data.includes("sim:")) {
                parse = data.replace('sim:', '').replace('\r\n', '').toString();
                msg.sim_result = JSON.parse(parse);
            }
            else {
                msg.implement = parseFloat(msg.payload.replace('[', '').replace(']', ''));
                msg.err_rate = msg.y_data - msg.implement;
                msg.payload = data;
            }
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            callPython(msg);
        });
        
    }
    RED.nodes.registerType("snn-iris-implement", SNN_IRIS_Implement);
}