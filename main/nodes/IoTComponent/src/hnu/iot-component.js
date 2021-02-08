module.exports = function(RED) {
    function IoTComponent(config) {
        RED.nodes.createNode(this,config);
        var component = this;
          var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python3',["nodes/IoTComponent/src/hnu/iot-component.py"]);
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
        component.on('input', function(msg) {
            callPython(msg);
        });
    }
    RED.nodes.registerType("IoTComponent",IoTComponent);
}
