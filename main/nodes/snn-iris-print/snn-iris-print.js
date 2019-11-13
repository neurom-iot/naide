module.exports = function(RED) {
    function SNN_IRIS_Print(n) {
        RED.nodes.createNode(this, n);
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
            json = {
                random_select_param:{x_data:msg.x_data, y_data:msg.y_data},
                implement:msg.implement,
                err_rate:msg.err_rate
            }
            debug = parseJson(json);
            pkgmgr = "";
            msg.payload = debug;
            msg.pkgmgr = pkgmgr;
            this.send(msg);
        };
        node.on('input', function(msg) {
            console.log(msg);
            sendFunction(msg);
        });
        
    }
    RED.nodes.registerType("snn-iris-print", SNN_IRIS_Print);
}