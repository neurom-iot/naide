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

    var sim_data;

    function init(_config) {
        config = _config;

        var content = $("<div>").css({"position":"relative","height":"100%"});
        var toolbar = $('<div class="red-ui-sidebar-header">'+
            '<label style="display: inline-block; margin-right: 3px;">Download File Type : </label>'+
            '<select style="margin-bottom: 2px; padding: 0px; width: 100px; height: 25px; margin-right: 5px;" id="sim-download-type">'+
                '<option value="json">JSON</option>'+
                '<option value="npz">npz</option>'+
                '<option value="npy">npy</option>'+
                '<option value="h5">h5</option>'+
            '</select>'+
            '<span class="button-group"><a id="red-ui-sidebar-file-download" class="red-ui-sidebar-header-button" href="#"><i class="fa fa-download"></i></a></span>'+
            '</div>').appendTo(content);

        var footerToolbar = $('<div>'+
            '<span class="button-group"><a id="red-ui-sidebar-debug-open" class="red-ui-footer-button" href="#"><i class="fa fa-desktop"></i></a></span> ' +
            '</div>');

        var simulatorContent = $('<div class="red-ui-debug-content na-ui-sidebar-simulator">' +
            '</div>').appendTo(content);

        var graphCanvas = $('<canvas id="na-ui-simulator-canvas" height="300"></canvas>').appendTo(simulatorContent);
        // ajax
        $(function() {
            $("#red-ui-sidebar-file-download").click(function() {
                let type = $("#sim-download-type").val()
                if (!sim_data) {
                    RED.notify("다운로드 오류 : 시뮬레이션 데이터가 없습니다.","error");
                    return;
                }
                if (type == "json") {
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(sim_data)));
                    element.setAttribute('download', "simulator-data.json");
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
                else {
                    $.ajax({
                        url: "/naide/makefile/sim/" + type,
                        type: "POST",
                        data: {sim_data: sim_data},
                        success: function(result) {
                            if (result.res) {
                                
                            }
                            else {
                                console.log(result.err);
                            }
                        }
                    });
                }
            });
        });
        

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
        sim_data = obj.sim_result;
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