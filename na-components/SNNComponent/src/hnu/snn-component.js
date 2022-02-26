module.exports = function(RED) {
    function SNNComponent(config) {
       RED.nodes.createNode(this, config);
        var component = this;
        var callPython = function(msg) {
        const data = msg.payload;
//rspi && jetson nano && panda
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python3',["na-components/NAAL/SNNComponent/src/hnu/snn-component.py",data]);
            pythonProcess.stdout.on('data', function(data) {
                sendFunction(Buffer.from(data, 'utf-8').toString());
            });
        };
        var sendFunction = (data) => {
                var msg = {};
                msg.payload = data.replace('\r\n', '').toString();
                split_data = data.split("|", 2);
                msg.select_number = Number(split_data[0]);
                this.send(msg);
            };
        component.on('input', function(msg) {
            callPython(msg);
        });
    };
    RED.nodes.registerType("SNNComponent",SNNComponent);
}