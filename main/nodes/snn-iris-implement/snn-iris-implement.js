module.exports = function(RED) {
    function SNN_IRIS_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(data) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', ["nodes/iris_python/nengo_iris_imp.py", data.toString()]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (data) => {
            var msg = {};
            console.log(data.toString());
            msg.payload = data.toString();
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            callPython(msg.payload);
        });
        
    }
    RED.nodes.registerType("snn-iris-implement", SNN_IRIS_Implement);
}