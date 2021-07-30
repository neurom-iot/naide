module.exports = function(RED) {
    function Pulse_Generator(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var pulseType = n.pulse;
        var pulseTime = n.hz;
        node.pulseInterval = null;
        node.on('input', function(msg) {
            if (!node.pulseInterval) {
                node.pulseValue = 0;
                node.pulseInterval = setInterval(function() {
                    if (pulseType == 0) {
                        node.pulseValue = (node.pulseValue + 1) % 2;
                    }
                    else {
                        node.pulseValue = Number.parseInt(Math.random() * 2);
                    }
                    msg.payload = node.pulseValue;
                    node.send(msg);
                }, pulseTime);
            }
            else {
                clearInterval(node.pulseInterval);
                node.pulseInterval = null;
                msg.payload = "clearInterval";
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("pulse-generator", Pulse_Generator);
}