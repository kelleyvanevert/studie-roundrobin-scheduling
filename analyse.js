
// Times and durations must be in the same units
var analyse = function(quantum, processes, switchtime, options) {
    
    // Settings
    var settings = {
        always_switch: true,
        verbose: false,
    };
    if (typeof options == "object") {
        for (key in settings) {
            if (options[key]) {
                settings[key] = options[key];
            }
        }
    }
    // Niceties for the human eye, and testing..
    var labels = (function() {
        var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        labels = abc.split("");
        for (var x = 0; x < 26; x++) {
            for (var y = 0; y < 26; y++) {
                labels.push(abc[x]+abc[y]);
            }
        }
        return labels;
    })();
    var log = [];
    // Log, with a time
    log.t = function(time, str) {
        if (settings.verbose) {
            this.push(time + ": " + str);
            console.log(this[this.length - 1]);
        }
    };
    // Simply log
    log.i = function(str) {
        if (settings.verbose) {
            this.push(str);
            console.log(this[this.length - 1]);
        }
    };
    
    // What we'll be doing is repeatedly jumping to the next event on
    //  the timeline and handling it..
    // Events: arrivals and running time completions
    // Whenever a new process is scheduled, a completion event gets added
    //  to the timeline, so that the main loop will get a chance to
    //  start running new programs / ..
    var timeline = {
        events: [], // Sorted by .time, asc
        current: -1,
        add: function(e) {
            var at = 0;
            while (at < this.events.length && this.events[at].time < e.time)
                at++;
            this.events.splice(at, 0, e);
            this.events.sort(function(a, b) {
                if (a.time == b.time) {
                    return a.arrival ? -1 : 1;
                } else {
                    return a.time > b.time ? 1 : -1;
                }
            });
            return true;
        },
        next: function() {
            return this.events[++this.current] || null;
        },
    };
    
    // Make the [[1,2],[3,4]] data of processes into an array
    //  of process objects; here we'll be storing most of our information
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
    
    // Add all process arrival events to the timeline
    processes.map(function(process) {
        timeline.add({
            arrival: true,
            time: process.arrival,
            process: process,
        });
    });
    
    // The queue. At each moment in time, the loop has a process queue,
    //  but of course we now already know which processes will be in the
    //  queue, and we know in what order they will appear, so it would
    //  be overkill to simulate all that: we'll just use our array
    //  of processes.
    var queue = {
        // We'll keep track of which processes have already arrived,
        //  and should be said to be "in queue"
        num: 0,
        arrival: function() {
            this.num++;
        },
        
        // To keep track of who's turn it is, we'll just increment-modulo
        //  the array index of the current process
        current: -1,
        next: function() {
            var process;
            var rotate = (arguments[0] === false) ? false : true;
            var cur = this.current;
            while (true) {
                cur = (cur + 1) % this.num;
                process = processes[cur];
                if (process.remaining > 0) {
                    if (rotate) {
                        this.current = cur;
                    }
                    return process;
                }
            }
            return process;
        },
        peek: function() {
            return this.next(false);
        },
        empty: function() {
            for (var i = 0; i < this.num; i++) {
                if (processes[i].remaining > 0) {
                    return false;
                }
            }
            return true;
        },
    };
    
    log.i("Quantum time        : "+quantum);
    log.i("Context switch time : "+switchtime);
    
    var switches = [];
    var runs = [];
    var e;
    var stop = -1; // When the current running process will stop
    while (e = timeline.next()) {
        console.log("@"+e.time);
        if (e.arrival) {
            log.t(e.time, "arrival of "+e.process.label);
            queue.arrival();
        }
        
        if (e.time >= stop && !queue.empty()) {
            var process = queue.peek();
            if (e.pid && e.pid != process.id) {
                log.t(e.time, "context switch");
                switches.push({
                    start: e.time,
                    duration: switchtime,
                });
                timeline.add({
                    time: e.time + switchtime,
                    run: process,
                });
            } else {
                queue.next();
                var finishing = process.remaining <= quantum;
                var d = finishing ? process.remaining : quantum;
                runs.push({
                    start: e.time,
                    duration: d,
                    pid: process.id,
                });
                stop = e.time + d;
                timeline.add({
                    time: stop,
                    finished: finishing,
                    pid: process.id,
                });
                if (finishing) {
                    process.finished = stop;
                }
                process.remaining -= d;
                log.t(e.time, "scheduling "+process.label+" ["+e.time+" .. "+stop+"]");
            }
        }
    }
    
    var stats = {
        max: {
            turn: 0,
        },
        total: {
            turn: 0,
            norm_turn: 0,
            resp: 0,
        },
        avg: {},
    };
    processes.map(function(p)
    {
        p.stats = {
            turn: p.finished - p.arrival,
            resp: p.finished - p.arrival,
        };
        stats.total.turn += p.stats.turn;
        stats.total.resp += p.stats.resp;
        
        stats.max.turn = Math.max(stats.max.turn, p.stats.turn);
    });
    processes.map(function(p)
    {
        p.stats.norm_turn = p.stats.turn / stats.max.turn;
        stats.total.norm_turn += p.stats.norm_turn;
    });
    for (k in stats.total) {
        stats.avg[k] = stats.total[k] / processes.length;
    }
    
    return {
        quantum: quantum,
        switchtime: switchtime,
        processes: processes,
        switches: switches,
        runs: runs,
        stats: stats,
        averages: stats.avg,
    };
};

if (typeof exports == "object") {
    exports.analyse = analyse;
}

