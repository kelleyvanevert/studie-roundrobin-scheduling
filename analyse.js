
/*
    - Times and durations must be in the same units
    
    Usage:
    var stats = analyse(100*1000, [
      // arrival, duration
        [3*1000000, 45*1000],
      // ...
    ], 50*1000);
*/

var analyse = function(quantum, processes, switchtime) {
    
    // Niceties for the human eye, and testing..
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
    var seconds = function(time) {
        return time / 1000000;
    };
    var log = [];
    var formatTime = function(time) {
        var str = seconds(time).toFixed(6);
        return new Array(11 - str.length).join(" ") + str;
    };
    // Log, with a time
    log.t = function(time, str) {
        this.push(formatTime(time) + ": " + str);
        console.log(this[this.length - 1]);
    };
    // Simply log
    log.i = function(str) {
        this.push(str);
        console.log(this[this.length - 1]);
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
            while (true) {
                this.current = (this.current + 1) % this.num;
                process = processes[this.current];
                if (process.remaining > 0) {
                    return process;
                }
            }
            return process;
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
    
    var e;
    var stop = -1; // When the current running process will stop
    while (e = timeline.next()) {
        if (e.arrival) {
            log.t(e.time, "arrival of "+e.process.label);
            queue.arrival();
        }
        
        if (e.time >= stop && !queue.empty()) {
            var process = queue.next();
            var d = Math.min(process.remaining, quantum);
            stop = e.time + d;
            timeline.add({
                time: stop,
            });
            process.remaining -= d;
            log.t(e.time, "scheduling "+process.label+" ["+seconds(e.time)+" .. "+seconds(stop)+"]");
        }
    }
    console.log("\nDONE");
    console.log("queue.empty? "+(queue.empty() ? "YES" : "NO"));
    
    return {
        
    };
};

analyse(100000, [
    [ 30,   783560],
    [ 54, 17282004],
    [ 97, 32814522],
    [133, 39986730],
    [163, 42805902],
    [181, 28249353],
    [204, 45561030],
    [249, 26369485],
    [287, 48582049],
    [325, 37274777],
    [365, 37144992],
    [399, 22059136],
    [424, 47168534],
    [455, 20090157],
    [488, 56053016],
    [531, 39640908],
    [572,   717403],
    [610, 34732701],
    [637, 21593761],
    [658, 48477451],
    [685, 21472914],
    [729, 44603773],
].map(function(v) {
    return [v[0]*1000000, v[1]];
}), 50000);

