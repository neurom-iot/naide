module.exports = function(RED) {
    function SNN_MNIST_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', ["nodes/mnist_python/nengo_mnist_imp.py"]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (data) => {
            var msg = {};
            console.log(data.toString());
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            callPython(msg);
        });
        
    }
    RED.nodes.registerType("snn-mnist-implement", SNN_MNIST_Implement);
}