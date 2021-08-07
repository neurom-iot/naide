module.exports = function(RED) {
    function Segment_Coral(config) {
       RED.nodes.createNode(this, config);
        var component = this;
        var callPython = function(msg) {
        const data = msg.payload;
//npm install sudo-js --save ÇÊ¿ä
            const sudo = require('sudo-js');
            sudo.setPassword('1234');//board password 
            sudo.exec(["python3",`${__dirname}/iot-component.py`,data],function(err,pid,data){
                sendFunction(Buffer.from(data, 'uft-8').toString());
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
    }
    RED.nodes.registerType("Segment_Coral",Segment_Coral);
}
