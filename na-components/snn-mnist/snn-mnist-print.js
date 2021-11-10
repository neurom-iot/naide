const { parse } = require("mustache");

module.exports = function(RED) {
    function SNN_MNIST_Print(c) {
        RED.nodes.createNode(this, c);
        var node = this;
        var parseJson = (json, level=0) => {
            res = "";
            for(data in json) {
                if (level == 0)
                    res += "[" + data + "]" + '\n';
                if (typeof(json[data]) == "object"){
                    res += parseJson(json[data], level + 1);
                }
                else {
                    res += "  ".repeat(level < 2 ? 1 : level);
                    res += (level > 0 ? data + " : " + json[data] : json[data]) + '\n';
                }
            }
            return res;
        };
        var sendFunction = (msg) => {
            // Debug / PkgMgr
            if (typeof(msg.sim_result) !== "undefined") {
                let last = msg.sim_result.last;
                number_rate = last;
                top_rate_number = null;
                console.log("ASDASD", msg.sim_result);
                for(var i = 0; i < last.length; i++) {
                    if (top_rate_number === null) {
                        top_rate_number = i;
                    }
                    else if (last[top_rate_number] < last[i]) {
                        top_rate_number = i;
                    }
                }
                
                json = {
                    random_select_param:msg.select_number,
                    top_rate_number:top_rate_number,
                    number_rate:number_rate
                }
                //console.log(json);
                debug = parseJson(json);
                pkgmgr = "";
                msg.payload = top_rate_number;
                msg.pkgmgr = pkgmgr;
                msg.src = msg.sim_result.image;
            }
            this.send(msg);
        };
        node.on('input', function(msg, send, done) {
            //console.log(msg);
            if (typeof msg.select_number === "undefined") {
                msg.select_number = 0;
            }
            sendFunction(msg);
        });
        
    }
    RED.nodes.registerType("snn-mnist-print", SNN_MNIST_Print);
}