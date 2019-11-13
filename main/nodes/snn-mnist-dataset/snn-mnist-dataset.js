module.exports = function(RED) {
    function SNN_MNIST_Dataset(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const rand = msg.payload ** 2 % 7;
            const spawn = require("child_process").spawn;
            
            const pythonProcess = spawn('python', ["nodes/mnist_python/nengo_mnist_data.py", rand]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (data) => {
            var msg = {};
            console.log(data.toString());
            msg.payload = data.replace('\r\n', '').toString();
            split_data = data.split("|", 2);
            msg.x_data = Number(split_data[0]);
            msg.y_data = Number(split_data[1]);
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            callPython(msg);
        });
        
    }
    RED.nodes.registerType("snn-mnist-dataset", SNN_MNIST_Dataset);
}