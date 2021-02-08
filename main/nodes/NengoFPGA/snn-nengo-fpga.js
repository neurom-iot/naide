module.exports = function(RED){
    function NengoFPGA(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const img = msg.payload;
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python3',["nodes/NengoFPGA/nengo-fpga/docs/examples/gui/fpga.py",img]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(Buffer.from(data, 'utf-8').toString());
            });
        }
            var sendFunction = (data) => {
                var msg = {};
                msg.payload = data.replace('\r\n', '').toString();
                split_data = data.split("|", 2);
                msg.select_number = Number(split_data[0]);
                this.send(msg);
            };

        node.on('input', function(msg) {
            console.log("ASDASFASDAS");
            console.log(msg);
            callPython(msg);
        });
    }
    RED.nodes.registerType("NengoFPGA", NengoFPGA);
}
