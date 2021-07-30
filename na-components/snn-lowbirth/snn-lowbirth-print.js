module.exports = function(RED) {
    function SNN_Lowbirth_Print(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        var codeEditor = RED.NAIDE.codeEditor.init(this, {
            codeText: n.codeText,
            callbackFunc: function(){}
        });

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
            parse = msg.payload.split("\r\n");
            number_rate = {};
            top_rate_number = null;
            for(var data in parse){
                if (parse[data].includes(':')){
                    n_data = parse[data].split(':');
                    number_rate[n_data[0]] = Number(n_data[1]);
                    top_rate_number = top_rate_number == null ? n_data[0] : number_rate[top_rate_number] < number_rate[n_data[0]] ? n_data[0] : top_rate_number
                }
            }
            json = {
                random_select_param:msg.select_number,
                top_rate_number:top_rate_number,
                number_rate:number_rate
            }
            console.log(json);
            debug = parseJson(json);
            pkgmgr = "";
            msg.payload = debug;
            msg.pkgmgr = pkgmgr;
            this.send(msg);
        };
        node.on('input', function(msg, send, done) {
            codeEditor.run(msg, send, done);
            //sendFunction(msg);
        });
        
    }
    RED.nodes.registerType("snn-lowbirth-print", SNN_Lowbirth_Print);
}