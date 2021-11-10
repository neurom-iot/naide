//const { NodeTestHelper } = require("node-red-node-test-helper");

module.exports = function(RED) {
    function encoder(n) {
        RED.nodes.createNode(this, n);
        var node = this;

        var encoder_type = n.checked_id;

        var simple_time_interval = n.simple_time_interval;
        var simplePoisson_time_interval = n.simple_poisson_time_interval;
        var poisson_time_interval = n.poisson_time_interval;

        var population1_neurons = n.population1_neurons;
        var population1_max_firing_time = n.population1_max_firing_time;
        var population1_not_to_fire = n.population1_not_to_fire;
        var population1_dt = n.population1_dt;


        var callPython = function(msg) {
//            console.log("callPython1");
            
            const et = encoder_type;
            const sti = simple_time_interval;
            const spti = simplePoisson_time_interval;
            const pti = poisson_time_interval;

            const pp1neu = population1_neurons;
            const pp1max = population1_max_firing_time;
            const pp1not = population1_not_to_fire;
            const pp1dt = population1_dt;

            const spawn = require("child_process").spawn;
            let argv = ["na-components/encoder/n3ml/encoder_component.py", et,sti,spti,pti,pp1neu,pp1max,pp1not,pp1dt];
            if (typeof msg.select_number === "undefined") {
                msg.select_number = 0;
                argv.push(msg.select_number);
                argv.push(msg.payload);
            }
            console.log(msg, argv);
            const pythonProcess = spawn('python', argv);
            pythonProcess.stdout.on('data', function(data) {
                //sendFunction(Buffer.from(data, 'utf-8').toString());
//                console.log("callPython2");
                sendFunction(Buffer.from(data, 'utf-8').toString());
            });
            
//            console.log("callPython3");

        }
        var sendFunction = (data) => {
            var msg = {};
//            console.log("send function");
            //console.log(data.toString());
            msg.payload = data.toString();
            msg.n3ml = true;
            msg.select_number = Number(msg.payload.split("|")[0])
            node.send(msg);
        };
        node.on('input', function(msg, send, done) {
            // console.log("encoder_type : ",encoder_type)
            // console.log("simple_time_interval : ", simple_time_interval)
            // console.log("simplePoisson_time_interval : ", simplePoisson_time_interval)
            // console.log("poisson_time_interval : ", poisson_time_interval)

            // console.log("population1_neurons : ", population1_neurons);
            // console.log("population1_max_firing_time : ", population1_max_firing_time);
            // console.log("population1_not_to_fire : ", population1_not_to_fire);
            // console.log("population1_dt : ", population1_dt);

//            console.log("test start");

            callPython(msg);

//            console.log("test start22");

        });
    }
    RED.nodes.registerType("encoder", encoder);
}

