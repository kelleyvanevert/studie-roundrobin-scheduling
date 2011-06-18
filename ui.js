
var app = {
    processes: [],
};
app.init = function() {
    this.colormap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(function(a, b) {
        return Math.random() < 0.5;
    });
    
    $(".quantum-bar").resizable({
        handles: "e",
        minHeight: $(".settings").height(),
        maxHeight: $(".settings").height(),
        minWidth: 50,
        maxWidth: 300,
        grid: [10, 10],
    });
    
    $(".switchtime-bar").resizable({
        handles: "e",
        minHeight: $(".settings").height(),
        maxHeight: $(".settings").height(),
        minWidth: 10,
        maxWidth: 100,
        grid: [10, 10],
    });
    
    this.processes.app = this;
    this.processes.init();
    
    $(".bar").hover(function() {
        $(this).addClass("hover");
    }, function() {
        $(this).removeClass("hover");
    });
    $(".bar").bind("dragstart", function() {
        $(this).addClass("active");
    });
    $(".bar").bind("dragstop", function() {
        $(this).removeClass("active");
    });
    $(".bar").bind("resizestart", function() {
        $(this).addClass("active");
    });
    $(".bar").bind("resizestop", function() {
        $(this).removeClass("active");
    });
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
        mseg("color-" + this.colormap[info.runs[i].pid], info.runs[i]);
    }
};
app.processes.init = function() {
    var mline = function(appends) {
        var line = $("<div>").addClass("line");
        appends.map(function(e) {
            line.append(e);
        });
        return line;
    };
    this.num = 4;
    var left = 0;
    for (var i = 0; i < 10; i++) {
        var process = $("<div>").addClass("bar process color-" + this.app.colormap[i]);
        var label = $("<div>").addClass("label").text("P" + i);
        var line = mline([label, process]).hide().appendTo(".processes");
        process.data("line", line);
        process.resizable({
            handles: "e",
            minHeight: process.height(),
            maxHeight: process.height(),
            minWidth: 30,
            maxWidth: 400,
            grid: [10, 10],
        });
        process.draggable({
            axis: "x",
            containment: "parent",
            grid: [10, 10],
        });
        if (i < this.num) {
            process.css({
                left: left,
                width: Math.floor((100 + Math.random() * 200) / 10) * 10,
            });
            left += Math.floor(Math.random() * 20) * 10;
        }
        this.push(process);
    }
    $(".line").droppable();
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
        } else if (e.which == 114) { // r for "reload"
            window.location.reload();
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

