
/*
    - Times and durations in nanoseconds
    
    Usage:
    var stats = analyse(100*1000, [
      // arrival, duration
        [3*1000000, 45*1000],
      // ...
    ], 50*1000);
*/

var analyse = function(quantum, processes, switchtime) {
    
    var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var labels = (function() {
        labels = abc.split("");
        for (var x = 0; x < 26; x++) {
            for (var y = 0; y < 26; y++) {
                labels.push(abc[x]+abc[y]);
            }
        }
        return labels;
    })();
    var log = [];
    
    var timeline = {
        events: [], // Sorted by .time, asc
        current: -1,
        add: function(e) {
            var at = 0;
            while (at < this.events.length && this.events[at].time < e.time)
                at++;
            this.events.splice(at, 0, e);
            return true;
        },
        next: function() {
            return this.events[++this.current] || null;
        },
    };
    
    processes = processes.sort(function(pa, pb) {
        var a = pa[0], b = pb[0];
        if (a == b) return 0;
        return (a > b) ? 1 : -1;
    }).map(function(process, id) {
        return {
            id: id,
            label: labels[id],
            arrival: process[0],
            duration: process[1],
            // temporary
            remaining: process[1],
        };
    });
    
    log.push("Processes: "+processes.map(function(process) {
        return process.label + "("+process.arrival+","+process.duration+")";
    }).join(", "));
    
    processes.map(function(process) {
        timeline.add({
            arrival: true,
            time: process.arrival,
            process: process,
        });
    });
    
    var queue = {
        processes: processes,
        num: 0, // "num n" means that we have {num} processes, that is, 0..(n+1), in the queue
        arrival: function() {
            this.num++;
        },
        current: -1, // Who's turn is it to run?
        next: function() {
            var process;
            while (true) {
                this.current = (this.current + 1) % this.num;
                process = this.processes[this.current];
                if (process.remaining > 0) {
                    return process;
                }
            }
            return process;
        },
        empty: function() {
            for (var i = 0; i < this.num; i++) {
                if (this.processes[i].remaining > 0) {
                    return false;
                }
            }
            return true;
        },
    };
    
    var e;
    var stop = -1; // When the current running process will stop
    while (e = timeline.next()) {
        console.log(e.time+":");
        // Enqueue arriving processes
        if (e.arrival) {
            console.log(" - arrival of "+e.process.label);
            queue.arrival();
        }
        
        // If we're (no longer) running any process..
        if (e.time >= stop) {
            console.log(" ..not running");
            // ..try to schedule next process
            if (!queue.empty()) {
                console.log(" ..queue not empty");
                var process = queue.next();
                console.log("   --> so we're going to schedule #"+process.label+", remaining: "+process.remaining);
                if (process.remaining <= quantum) {
                    stop = e.time + process.remaining;
                    console.log("   ..lower than quantum, next stop: "+stop);
                    timeline.add({
                        time: stop,
                    });
                    process.remaining = 0;
                    // ..
                } else {
                    stop = e.time + quantum;
                    console.log("   ..longer, next stop: "+stop+", adding timeline stop and process to queue..");
                    // ..
                    timeline.add({
                        time: stop,
                    });
                    process.remaining -= quantum;
                }
            }
        }
    }
    console.log("\nDONE");
    console.log("queue.empty? "+(queue.empty() ? "YES" : "NO"));
    console.log("Log:\n"+log.join("\n"));
    
    return {
        
    };
};

analyse(3, [
    [0, 5],
    [2, 2],
    [2, 2],
    [3, 6],
], 1);

