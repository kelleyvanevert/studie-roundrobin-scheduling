
var app = {
    processes: [],
};
app.init = function() {
    this.quantum = $("<div>").addClass("bar quantum").appendTo(".settings").text("Quantum");
    this.quantum.resizable({
        handles: "e",
        minHeight: this.quantum.height(),
        maxHeight: this.quantum.height(),
        minWidth: 50,
        maxWidth: 300,
        grid: [5, 5],
    });
    
    this.switchtime = $("<div>").addClass("bar switchtime").appendTo(".settings").text("Switchtime");
    this.switchtime.resizable({
        handles: "e",
        minHeight: this.quantum.height(),
        maxHeight: this.quantum.height(),
        minWidth: 10,
        maxWidth: 100,
        grid: [5, 5],
    });
    
    this.processes.init();
};
app.processes.init = function() {
    var mline = function(depth, appends) {
        var line = $("<div>").addClass("processline no-"+depth);
        if (depth > 0) {
            line.append(mline(depth - 1, appends));
        } else {
            appends.map(function(e) {
                line.append(e);
            });
        }
        return line;
    };
    for (var i = 0; i < 10; i++) {
        var process = $("<div>").addClass("bar process no-" + i);
        var num = $("<div>").addClass("num").text("P" + i);
        var line = mline(i, [num, process]).hide().appendTo(".processes");
        process.data("line", line);
        process.resizable({
            handles: "e",
            minHeight: process.height(),
            maxHeight: process.height(),
            grid: [5, 5],
        });
        process.draggable({
            axis: "x",
            containment: "parent",
            grid: [5, 5],
        });
        this.push(process);
    }
    this.num = 5;
    for (var i = 0; i < this.num; i++) {
        this[i].data("line").show();
    }
};
app.processes.add = function() {
    if (this.num < this.length) {
        this[this.num].data("line").show();
        this.num++;
    }
};
app.processes.drop = function() {
    if (this.num > 3) {
        this.num--;
        this[this.num].data("line").hide();
    }
};
app.processes.getTimes = function() {
    var times = [];
    for (var i = 0; i < this.num; i++) {
        times.push([this[i].position().left, this[i].width()]);
    }
    return times;
};

$(function() {
    app.init();
    $(window).keypress(function(e) {
        if (e.which == 110) { // n for "new process"
            app.processes.add();
        } else if (e.which == 100) { // d for "delete-" or "drop process"
            app.processes.drop();
        } else if (e.which == 99) { // c for "calculate!"
            analyse(100, app.processes.getTimes(), 10);
        } else {
            console.log(e.which);
        }
    });
});

