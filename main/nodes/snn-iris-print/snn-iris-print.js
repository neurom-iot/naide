module.exports = function(RED) {
    function NeuromorphicArchitectureNode(n) {
        RED.nodes.createNode(this, n);
        var when = require('when');
        var node = this;
        this.min = n.min;
        this.max = n.max;
        this.savePath = n.savePath
        var prom = function(min, max) {
            return when.promise(function(res, rej) {
                const spawn = require("child_process").spawn;
                const pythonProcess = spawn('python', ["./createNode/python/test.py", min.toString(), max.toString()]);
                pythonProcess.stdout.on('data', function(data) {
                    res(data);
                });
            });
        }
        var sendFunction = (data) => {
            console.log(data.toString());
            if (this.min === this.max) {
                this.send(null);
            }
            else {
                //var str = data.toString().replace("\n", "");
                //str = Number(str).toString();
                this.msg.payload = data.toString();
                this.send(this.msg);
            }
        };
        node.on('input', function(msg) {
            console.log(msg);
            this.msg = msg;
            prom(this.min, this.max).then(sendFunction, ()=>{});
        });
        
    }
    RED.nodes.registerType("na-node", NeuromorphicArchitectureNode);
}