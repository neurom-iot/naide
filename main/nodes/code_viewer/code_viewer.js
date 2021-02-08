const { text } = require("body-parser");

module.exports = function(RED) {
    function Code_Viewer(n) {
        RED.nodes.createNode(this, n);
        var resultFunc = function(context) {
            console.log("callbackFunction !!");
        }
        //
        var textEditor = RED.NAIDE.textEditor.init(this, {
            codeText: n.codeText,
            callbackFunc: resultFunc
        });
        this.on('input', function(msg, send, done) {
            textEditor.run(msg, send, done);
        });
    }
    RED.nodes.registerType("code_viewer", Code_Viewer);
}