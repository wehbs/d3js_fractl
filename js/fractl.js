var svg = d3
  .select(".chart")
  .append("svg")
  //   Makes the chart responsive
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 960 450")
  .classed("svg-content", true)
  .append("g");

svg.append("g").attr("class", "slices");
svg.append("g").attr("class", "labels");
svg.append("g").attr("class", "lines");

var width = 960,
  height = 450,
  radius = Math.min(width, height) / 2;

var pie = d3.layout
  .pie()
  .sort(null)
  .value(function(d) {
    return d.value;
  });

var arc = d3.svg
  .arc()
  .outerRadius(radius * 0.7)
  .innerRadius(radius * 0.4);
// Rearrange the shape of the lines for the labels
// I couldnt get them exactly how I wanted them
var outerArc = d3.svg
  .arc()
  .innerRadius(radius * 0.5)
  .outerRadius(radius * 1.1);

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var key = function(d) {
  return d.data.label;
};

// Same colors from the assignment for the chart
var color = d3.scale
  .ordinal()
  .range([
    "#b9c8d0",
    "#62767d",
    "#475153",
    "#55aeb6",
    "#018592",
    "#01747a",
    "#ff8339",
    "#ff6100"
  ]);

// Data for the chart
var data = [
  {
    label: "300-499",
    value: 4.7
  },
  {
    label: "500-549",
    value: 6.8
  },
  {
    label: "550-599",
    value: 8.5
  },
  {
    label: "600-649",
    value: 10
  },
  {
    label: "650-699",
    value: 13.2
  },
  {
    label: "700-749",
    value: 17.1
  },
  {
    label: "750-799",
    value: 19
  },
  {
    label: "800-850",
    value: 20.7
  }
];

/* ------- PIE SLICES -------*/
var slice = svg
  .select(".slices")
  .selectAll("path.slice")
  .data(pie(data), key);

slice
  .enter()
  .insert("path")
  .style("fill", function(d) {
    return color(d.data.label);
  })
  .attr("class", "slice");

slice
  .transition()
  //   Fills in the pie chart piece by piece
  .delay(function(d, i) {
    return i * 500;
  })
  .duration(500)
  .attrTween("d", function(d) {
    var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
    return function(t) {
      d.endAngle = i(t);
      return arc(d);
    };
  });

/* ------- TEXT LABELS -------*/

var text = svg
  .select(".labels")
  .selectAll("text")
  .data(pie(data), key);

text
  .enter()
  .append("text")
  //   Moves the label position up and down
  .attr("dy", "-3")
  //   Added class so I could style the labels
  .attr("class", "labelName")
  .text(function(d) {
    return d.data.label;
  });

function midAngle(d) {
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

text
  .transition()
  .attrTween("transform", function(d) {
    this._current = this._current || d;
    var interpolate = d3.interpolate(this._current, d);
    this._current = interpolate(0);
    return function(t) {
      var d2 = interpolate(t);
      var pos = outerArc.centroid(d2);
      //   Left and right positioning
      pos[0] = radius * 0.75 * (midAngle(d2) < Math.PI ? 1 : -1);
      return "translate(" + pos + ")";
    };
  })
  .styleTween("text-anchor", function(d) {
    this._current = this._current || d;
    var interpolate = d3.interpolate(this._current, d);
    this._current = interpolate(0);
    return function(t) {
      var d2 = interpolate(t);
      return midAngle(d2) < Math.PI ? "start" : "end";
    };
  });

/* ------- TEXT VALUES -------*/

text
  .enter()
  .append("text")
  //   Moves the text value position up and down
  .attr("dy", ".35em")
  //   Added class so I could style the labels
  .attr("class", "labelValue")
  //   Fill the colors of the value labels with the same colors from the slices
  .style("fill", function(d) {
    return color(d.data.label);
  })
  .text(function(d) {
    return d.data.value + "%";
  });

function midAngle(d) {
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

text
  .transition()
  .attrTween("transform", function(d) {
    this._current = this._current || d;
    var interpolate = d3.interpolate(this._current, d);
    this._current = interpolate(0);
    return function(t) {
      var d2 = interpolate(t);
      var pos = outerArc.centroid(d2);
      //   Left and right positioning
      pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
      return "translate(" + pos + ")";
    };
  })
  .styleTween("text-anchor", function(d) {
    this._current = this._current || d;
    var interpolate = d3.interpolate(this._current, d);
    this._current = interpolate(0);
    return function(t) {
      var d2 = interpolate(t);
      return midAngle(d2) < Math.PI ? "start" : "end";
    };
  });

/* ------- SLICE TO TEXT POLYLINES -------*/

var polyline = svg
  .select(".lines")
  .selectAll("polyline")
  .data(pie(data), key);

polyline.enter().append("polyline");

polyline.transition().attrTween("points", function(d) {
  this._current = this._current || d;
  var interpolate = d3.interpolate(this._current, d);
  this._current = interpolate(0);
  return function(t) {
    var d2 = interpolate(t);
    var pos = outerArc.centroid(d2);
    //   How far out the line goes
    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
    return [arc.centroid(d2), outerArc.centroid(d2), pos];
  };
});

// Used to make callback work after animation in Animate.CSS
var animationEnd = (function(el) {
  var animations = {
    animation: "animationend",
    OAnimation: "oAnimationEnd",
    MozAnimation: "mozAnimationEnd",
    WebkitAnimation: "webkitAnimationEnd"
  };

  for (var t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }
})(document.createElement("div"));

$(".title")
  .addClass("animated slideInRight")
  .one(animationEnd, function() {
    $("img").css("display", "inline-block");

    $("img").addClass("animated slideInUp realSlow");
  });

$(".svg-container").css("display", "inline-block");
$(".svg-container").addClass("animated slideInLeft");
