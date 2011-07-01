
var fs = require("fs"),
    stdin = process.openStdin(),
    analyse = require("./analyse").analyse;

fs.readFile("./data", function(err, data) {
    if (err)
        throw err;
    
    var lines = data.toString().split("\n");
    var processes = lines.reduce(function(processes, line) {
        var m;
        if (m = line.match(/^([0-9]+) ([0-9\.]+)$/)) {
            processes.push([parseInt(m[1])*1000000, Math.ceil(parseFloat(m[2])*1000000)]);
        }
        return processes;
    }, []);
    
    console.log(
        "| Hi there!\n"+
        "| Please enter parameters for analysis, i.e.\n"+
        "| 100,5; 200,10"
    );
    
    stdin.on("data", function(chunk) {
        var times = chunk.toString().slice(0, -1).trim().replace(/[^0-9,;]/g, "").split(";");
        times = times.reduce(function(times, str) {
            var m;
            if (m = str.match(/^([0-9]+),([0-9]+)$/)) {
                times.push([m[1], m[2]]);
            }
            return times;
        }, []);
        
        if (times.length == 0) {
            console.log("| try again!");
            return;
        }
        
        var results = times.map(function(t) {
            return analyse(t[0]*1000, processes, t[1]*1000);
        });
        results.map(function(res) {
            console.log("| Results for ("+(res.quantum/1000)+", "+(res.switchtime/1000)+"):");
            console.log("|  - Average turnaround time: "+(Math.floor(res.stats.avg.turn)/1000000));
            console.log("|  - Average normalized turnaround time: "+res.stats.avg.norm_turn);
            console.log("|  - Average response time: "+(Math.floor(res.stats.avg.resp)/1000000));
        });
        console.log("| One more try?");
    });
});

