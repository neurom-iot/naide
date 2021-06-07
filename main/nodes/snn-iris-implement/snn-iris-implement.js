module.exports = function(RED) {
    function SNN_IRIS_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', ["nodes/iris_python/nengo_iris_imp.py", msg.payload.toString()]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(msg, Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (msg, data) => {
            console.log(data.toString());
            msg.implement = parseFloat(msg.payload.replace('[', '').replace(']', ''));
            msg.err_rate = msg.y_data - msg.implement;
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            callPython(msg);
        });
        
    }
    RED.nodes.registerType("snn-iris-implement", SNN_IRIS_Implement);
}