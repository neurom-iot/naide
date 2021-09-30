if (!RED) {
    var RED = {}
}
if (!RED.NAIDE) {
    RED.NAIDE = {};
}
RED.NAIDE.simulator = (function() {
    var config;

    var view = 'list';
    var messages = [];
    var messagesByNode = {};

    var filterType = "filterAll";

    var sbc;
    var numMessages = 100;
    var chart;

    function init(_config) {
        config = _config;

        var content = $("<div>").css({"position":"relative","height":"100%"});
        var toolbar = $('<div class="red-ui-sidebar-header">'+
            '<span class="button-group"><a id="red-ui-sidebar-file-download" class="red-ui-sidebar-header-button" href="#"><i class="fa fa-download"></i></a></span>'+
            '</div>').appendTo(content);

        var footerToolbar = $('<div>'+
            '<span class="button-group"><a id="red-ui-sidebar-debug-open" class="red-ui-footer-button" href="#"><i class="fa fa-desktop"></i></a></span> ' +
            '</div>');

        var simulatorContent = $('<div class="red-ui-debug-content na-ui-sidebar-simulator">' +
            '</div>').appendTo(content);

        var graphCanvas = $('<canvas id="na-ui-simulator-canvas" height="300"></canvas>').appendTo(simulatorContent);
        return {
            content: content,
            footer: footerToolbar
        }

    }

    function getTimestamp() {
        var d = new Date();
        return d.toLocaleString();
    }

    function sanitize(m) {
        return m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    var stack = [];
    var busy = false;
    function handleSimMessage(o) {
        if (o) { stack.push(o); }
        if (!busy && (stack.length > 0)) {
            busy = true;
            processSimMessage(stack.shift());
            setTimeout(function() {
                busy = false;
                handleSimMessage();
            }, 15);  // every 15mS = 66 times a second
            if (stack.length > numMessages) { stack = stack.splice(-numMessages); }
        }
    }

    

    function processSimMessage(o) {
        obj = JSON.parse(o.msg);
        const last = obj.sim_result.last;
        const data = obj.sim_result.data;
        const label = obj.sim_result.trange;
        // 표시할 데이터셋 만들기
        let rgb = [
            "0, 84, 255",
            "255, 187, 0",
            "34, 116, 28",
            "255, 0, 127",
            "95, 0, 255",
            "103, 0, 0",
            "243, 97, 220",
            "93, 93, 93",
            "153, 138, 0",
            "0, 216, 255"
        ];
        let datasets = [];
        for(let i = 0; i < last.length; i++) {
            info = {};
            info.label = i;
            info.data = [];
            for(let t = 0; t < data.length; t++) {
                info.data.push(data[t][i]);
            }
            info.borderColor = "rgb(" + rgb[i] + ")";
            info.backgroundColor = "rgb(" + rgb[i] + ")";
            info.fill = false;
            info.lineTension = 0;
            datasets.push(info);
        }


        let canvas = $("#na-ui-simulator-canvas");
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels : label,
                datasets: datasets
            },
            options: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Simulation time'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'params'
                    }
                }]
            }
        });
    }


    return {
        init: init,
        handleSimMessage: handleSimMessage
    }
})();