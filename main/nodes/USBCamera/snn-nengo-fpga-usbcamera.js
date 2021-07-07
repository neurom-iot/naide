module.exports = function(RED){
    function USBCamera(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var callPython = function(msg) {
            const spawn = require("child_process").spawn;
            const pythonProcess = spawn('python3',["nodes/USBCamera/usbcameras.py",n]);
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
	    console.log("@");
            callPython(msg);
        });
    }
    RED.nodes.registerType("USBCamera", USBCamera);
}
