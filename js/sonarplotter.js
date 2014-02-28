  var plot;
  var seriesPairs = [];
  var widthk = 1;

  function initPlotter(){

      // set initial options
      var options = {

        grid: {
                clickable: true,
                backgroundColor: '#26292B', 
                mouseActiveRadius: 20
              },

        hooks: { draw: [function(plot, canvascontext) {

                        for (var i=0;i<seriesPairs.length;i++) {

                          // Add a hook to fill the space between a given series

                          fillseries(plot, canvascontext, seriesPairs[i][0],seriesPairs[i][1], seriesPairs[i][3], seriesPairs[i][4]);
                        }
                        }],
              },
         
        series: {
                  color: '#269246',
                  lines: {
                    show: true,
                    lineWidth: 0,
                    fill: false
                  },
                  points: { show: false }
        },
        
        zoom: {
          interactive: true,


        },

        pan: {
          interactive: true

        },

        xaxis: {
          min: 0,
          max: 360,
          //tickSize: 60,
          position: "top",
          zoomRange: [100, 360], // set preferred range here, y-axis zoom will fit it
          panRange: [0, 360]
        
        },
        
        yaxis: {
          max: 0, // set initial top/bottom values, will change it when first series added
          min: 0,
          mode: "time",
          zoomRange: [0,0],
          panRange: [0,0],

          //format labels
          tickFormatter: function (v, axis) {
            var dat = new Date(v);
 
                var h = dat.getHours() < 10 ? "0" + dat.getHours() : dat.getHours();
                var m = dat.getMinutes() < 10 ? "0" + dat.getMinutes() : dat.getMinutes();
                var s = dat.getSeconds() < 10 ? "0" + dat.getSeconds() : dat.getSeconds();
 
                return h + ":" + m + ":" + s;
          }
        }
      };

      // Make/draw blank plot with all prepaired options
      plot = $("#container").plot([0,0], options).data("plot");

    }

    // Fill between series to show width.
    // Id's of the series to be filled and selected are stored in seriesPairs array.
    //
    // Function below is used in plot options draw hooks. Each time plot draws it iterates over seriesPairs 
    // and uses 'fillseries' to fill series and draw selections

    function fillseries(plot, canvascontext, idl, idr, selected, color){
        var ctx = canvascontext;

        var s, series, series1,
        i = 0,
        a = true;
        
        // Find series by names
        while (a) {

          s = plot.getData()[i];
          if (s == undefined) {
            break;
          } else if (s.id == idl) {
            series = s;
          }
          else if (s.id == idr) {
            series1 = s;
            break;
          }
          
          i++;

        }

        if (series != null && series1 != null) {

          var points = series.datapoints.points,
              points1 = series1.datapoints.points;
          var xAxis = plot.getAxes().xaxis,
              yAxis = plot.getAxes().yaxis;

          var x,y;

          // Start drawing
          ctx.beginPath();

          // First series
          for (var i=0; i <= points.length; i++) {
          if (i%2 == 1)
            {
              x = points[i-1];
              y = points[i];
              ctx.lineTo(xAxis.p2c(x)+plot.offset().left-8,yAxis.p2c(y)+plot.offset().top-8);
            }
          }
          // Second series
          for (var i=points1.length; i >= 0; i--) {
          if (i%2 == 1)
            {
              x = points1[i-1];
              y = points1[i];
              ctx.lineTo(xAxis.p2c(x)+plot.offset().left-8,yAxis.p2c(y)+plot.offset().top-8);
            }
          }

          // Close path by moving to the initial point
          //ctx.lineTo(xAxis.p2c(points[0]+plot.offset().left-8),yAxis.p2c(points[1])+plot.offset().top-8);

          var grd = ctx.createLinearGradient(0, 50, 0, 620);
          //grd.addColorStop(0, '#8BEE6F');
          if (color != null ) {
            grd.addColorStop(0, color);
          } else {
            grd.addColorStop(0, 'rgba(124,229,82, 0.1)'); 
            grd.addColorStop(0.5, "rgba(124,229,82, 0.9)");
            grd.addColorStop(0.663, "rgba(124,229,82, 0.9)");
          }
          if (color != null ) {
            grd.addColorStop(1, color);
          } else {
            grd.addColorStop(1, 'rgba(124,229,82, 0.1)')
          }

          //ctx.stroke();
          ctx.fillStyle = grd;

          // Add stroke to selected series
          if (selected) {
            $('#selectedSeries').html(idl.slice(2));
            addSelectionListener(idl.slice(2));
            ctx.lineWidth = 10;
            ctx.strokeStyle = "rgba(99,229,82, 0.2)";
            ctx.fill();
            ctx.stroke();
          }
          else {
            ctx.fill(); 
          }

          // Close offset areas of previous fill which appears while graph zooming by white rectangles
          ctx.beginPath();
          ctx.rect(0,0,500,20);
          ctx.rect(0,594,500,6);
          ctx.rect(0,0,55,594);
          ctx.rect(490,0,10,594);
          ctx.fillStyle = 'white';
          ctx.fill();

          // Close frame
          ctx.beginPath();
          ctx.rect(56,20,435,3);
          ctx.rect(55,20,3,574);
          ctx.rect(490,20,3,574);
          ctx.rect(56,591,435,3);
          ctx.fillStyle = '#424242';
          ctx.fill(); 

        }
  
    }

    //Plot click event         
    $("#container").bind("plotclick", function (event, pos, item) {

        // Remove any selections
        removeSelections();
        
        // If we pointed series
        if (item){
          var series = item.series.id;

          if (series != 'l+Heading' && series != 'r+Heading') {
            // Find pair of current series
            for (var i = 0; i < seriesPairs.length; i++){
              if (seriesPairs[i][0] == series || seriesPairs[i][1] == series) {
                
                // Set current series selected status in seriesPairs array.
                // Before plot will draw it'll iterate over seriesPair.
                seriesPairs[i][3] = true;
                
                // Redraw with selections
                var pData = plot.getData(),
                    pOptions = plot.getOptions();
                plot = $.plot($("#container"), pData, pOptions);
                break;
              }
            }
          }
        }
        else {
          // Redraw, selections have been already removed earlier
          var pData = plot.getData(),
              pOptions = plot.getOptions();
          plot = $.plot($("#container"), pData, pOptions);
        }
    });



    function removeSelections(){
      $('#selectedSeries').html('');
      addSelectionListener();
      for (var i = 0; i < seriesPairs.length; i++){
        seriesPairs[i][3] = false;
      }
    }

    //////////////////
    // api functions

    function clearPlotter() {
          
      data = [0,0];
      var pOptions = plot.getOptions();
      plot = $.plot('#container', data, pOptions);

    }
    
    function addSelectionListener(seriesName) {
    
      if (seriesName == null) {
        // selections removed
      } else {
        // seriesName selected
      }
    }

    function addHeading(time, bearing) {

      addDetection(time, 'Heading', bearing, '5'); // time, name, bearing, width

    }

    function addDetection(time, seriesName, bearing, strength){
      // Noise source should have a width parameter, so we represent it as a pair of series 
      // with different distance in each point. 
      // We'll fill this series between in order to achieve a monolithic form view.

      var lseriesName = 'l+' + seriesName, // Left series id
          rseriesName = 'r+' + seriesName;  // Right series id

      var k = widthk; // Width koeff

      // Split bearing into 2 points
      var bearingl = bearing - k*strength,
          bearingr = bearing + k*strength;

      // Time to plotter format
      var d = new Date("January 1, 1970 " +time);
      var t = d.getTime(); 

      // Get plot data
      var plData = plot.getData();

      var notfound = true,
          timeDelta;

      // Search wether lseriesName exists in current plot data
      for (var i=0;i<plData.length;i++) {


        if (plData[i].id == lseriesName) {

          // Update points
          plData[i].data.push([bearingl, t]); // left series
          plData[i+1].data.push([bearingr, t]); // right series

          // get current axes
          var axes = plot.getAxes();

          // In order to move plot we need to increase it's borders in options
          //var l = plData[i].data.length;
          timeDelta = t - axes.yaxis.datamax; // time between last point in data and given time

          // Update plot options to move it
          plot.getOptions().yaxes[0].max += timeDelta;
          plot.getOptions().yaxes[0].min += timeDelta;
          
          plot.getOptions().yaxes[0].panRange[0] += timeDelta;
          plot.getOptions().yaxes[0].panRange[1] += timeDelta;

          plot.setupGrid();

          // Check wether first point of data came out of visible area and remove it
          if (plData[i].data[0][1] < plot.getOptions().yaxes[0].min) {
            plData[i].data.splice(0,1);
            plData[i+1].data.splice(0,1);
          }
                    
          // get current options without zoom modifications
          var plOptions = plot.getOptions();

          // set zoom modifications picked from the state of current axes
          plOptions.yaxis.max = axes.yaxis.max;
          plOptions.yaxis.min = axes.yaxis.min;
          plOptions.xaxis.min = axes.xaxis.min;
          plOptions.xaxis.max = axes.xaxis.max;

          // Save and update plot
          plot = $.plot('#container', plData, plOptions);

          notfound = false;

          break;
        } 
      }

      if (notfound) {

          // Prepare array for data
          var allseries = [];

          // Update seriesPairs
          if (seriesName == 'Heading') {
          seriesPairs.push([lseriesName, rseriesName, seriesName, false, 'rgba(168,5,255,0.5)']);
          } else {
            seriesPairs.push([lseriesName, rseriesName, seriesName, false]);
          }

          // Create new data series - lseriesNameData, rseriesNameData
          var lseriesNameData = [], rseriesNameData = [];
          
          lseriesNameData.push([bearingl, t]);
          rseriesNameData.push([bearingr, t]);

          var i;

          // Save old data
          for (i=0;i<plData.length;i++) {
            allseries.push(plData[i]);
          }

          // Add new data
          allseries.push({id: lseriesName, data: lseriesNameData});
          allseries.push({id: rseriesName, data: rseriesNameData});

          
          // Update plot

          // get current axes
          var axes = plot.getAxes();

          // In order to move plot we need to increase it's borders in options
          if (plData[i-1] != null) {

            timeDelta = t - axes.yaxis.datamax; // time between last point in data and given time
            
          } else {

            timeDelta = 3000; // If no data before set timeDelta to 3s
          
          }

          // Update plot options to move it
          if (seriesName == 'Heading') { // If it's the very first time plot draws any data, we set initial boundaries for ~ 1 hour around Heading.
            plot.getOptions().yaxes[0].max = t + 5000;
            plot.getOptions().yaxes[0].min = t - 3600000; // set plot Y-axis boundaries

            plot.getOptions().yaxes[0].panRange = [t - 3600000, t + 5000];
            plot.getOptions().yaxes[0].zoomRange = [0, 3605000]; // from 0 to (max - min)


          } else { // All other new detections goes with delta
            plot.getOptions().yaxes[0].max += timeDelta;
            plot.getOptions().yaxes[0].min += timeDelta;
            plot.getOptions().yaxes[0].panRange[0] += timeDelta;
            plot.getOptions().yaxes[0].panRange[1] += timeDelta;

          } 
          plot.setupGrid();

            
          // get current options without zoom modifications
          var plOptions = plot.getOptions();

          // set zoom modifications picked from the state of current axes
          plOptions.yaxis.max = axes.yaxis.max;
          plOptions.yaxis.min = axes.yaxis.min;
          plOptions.xaxis.min = axes.xaxis.min;
          plOptions.xaxis.max = axes.xaxis.max;

          // Save and update plot
          plot = $.plot('#container', allseries, plOptions);
         
      }
    }