const fs = require('fs');

module.exports = function(RED) {
    function SNN_MNIST_Implement(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            let argv = ["na-components/snn-mnist/python/nengo_mnist_imp.py", msg.payload, msg.select_number.toString()];
            if (msg.n3ml) {
                fs.writeFileSync(__dirname + "/data.dat", msg.payload);
                argv.push(__dirname + "/data.dat");
                argv[1] = "";
            }
            const pythonProcess = spawn('python', argv);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(msg, Buffer.from(data, 'utf-8').toString());
            });
        }
        var sendFunction = (msg, data) => {
            //console.log(data);
            if (data.includes("sim:")) {
                parse = data.replace('sim:', '').replace('\r\n', '').toString();
                msg.sim_result = JSON.parse(parse);
            }
            else {
                msg.payload = data;
            }
            //msg.payload = data;
            this.send(msg);
        };
        node.on('input', function(msg) {
            //console.log(msg);
            callPython(msg);
        });
        
    }
    RED.nodes.registerType("snn-mnist-implement", SNN_MNIST_Implement);
}