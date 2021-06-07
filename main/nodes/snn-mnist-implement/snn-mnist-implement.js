module.exports = function(RED) {
    function SNN_MNIST_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python', ["nodes/mnist_python/nengo_mnist_imp.py", msg.payload, msg.select_number.toString()]);
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
    RED.nodes.registerType("snn-mnist-implement", SNN_MNIST_Implement);
}