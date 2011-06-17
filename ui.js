
var app = {
    processes: [],
};
app.init = function() {
    $(".quantum-bar").resizable({
        handles: "e",
        minHeight: $(".settings").height(),
        maxHeight: $(".settings").height(),
        minWidth: 50,
        maxWidth: 300,
        grid: [5, 5],
    });
    
    $(".switchtime-bar").resizable({
        handles: "e",
        minHeight: $(".settings").height(),
        maxHeight: $(".settings").height(),
        minWidth: 10,
        maxWidth: 100,
        grid: [5, 5],
    });
    
    this.processes.app = this;
    this.processes.init();
    
    $(window).resize(function() {
        this.layout();
    }.bind(this)).resize();
};
app.layout = function() {
    $(".timeline, .timeline .segment").height($(window).height() - $(".timeline").offset().top - 20);
};
app.display = function(info) {
    $(".timeline").html("");
    var mseg = function(classes, timing) {
        $("<div>").addClass("segment " + classes).appendTo(".timeline").css({
            left: timing.start,
            width: timing.duration - 1,
        });
    };
    for (var i = 0; i < info.switches.length; i++) {
        mseg("switch", info.switches[i]);
    }
    for (var i = 0; i < info.runs.length; i++) {
        mseg("color-" + info.runs[i].pid, info.runs[i]);
    }
    this.layout();
};
app.processes.init = function() {
    var mline = function(appends) {
        var line = $("<div>").addClass("line");
        appends.map(function(e) {
            line.append(e);
        });
        return line;
    };
    for (var i = 0; i < 10; i++) {
        var process = $("<div>").addClass("bar process color-" + i);
        var label = $("<div>").addClass("label").text("P" + i);
        var line = mline([label, process]).hide().appendTo(".processes");
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
        this.app.layout();
    }
};
app.processes.drop = function() {
    if (this.num > 3) {
        this.num--;
        this[this.num].data("line").hide();
        this.app.layout();
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
        } else if (e.which == 99 || e.which == 97) { // c for "calculate!", a for "analyse!"
            var info = analyse(
                $(".quantum-bar").width(),
                app.processes.getTimes(),
                $(".switchtime-bar").width()
            );
            app.display(info);
        } else {
            console.log(e.which);
        }
    });
});

