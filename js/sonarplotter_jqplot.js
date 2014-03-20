  var plot;
  var bandsData = [];
  var widthk = 1;

  function initPlotter(){

      // initial plot options object

      var options = {
        // Heading color
        seriesColors: ["","rgba(168,5,255,1)"],

        grid: {
          backgroundColor: '#26292B',
          gridLineColor: '#424242'
        },

        sortData: false,

        seriesDefaults:{

          //lineWidth: 0.5,
          shadow: false,
          markerOptions: {

            show: false

          },
          rendererOptions: {

            highlightMouseDown: true

          },
        },

        //zoom ability
        cursor:{ 
          show: true,
          zoom:true, 
          showTooltip:false
        }, 

        axes: {
          xaxis: {
            tickOptions: {formatString: '%d'},
            min: 0,
            max: 360,
            numberTicks: 7
          },
          
          yaxis: {
            tickOptions: {formatString: '%H:%M:%S'},
            renderer:$.jqplot.DateAxisRenderer,
          }
        },
      };

      // Make/draw blank plot with all prepaired options
      plot = $.jqplot('container',  [[null]], options);

    }

    //////////////////
    // api functions

    function clearPlotter() {

      var pOptions = plot.options;
      plot = $.jqplot('container', [[null]], pOptions);

    }
    
    // This is called when we select a series, seriesName is passed as an argument
    function addSelectionListener(seriesName) {
      
      if (seriesName == null) {
        $('#selectedSeries').html('');
        // selections removed
      } else {
        $('#selectedSeries').html(seriesName);
        // seriesName selected
      }
    }

    function addHeading(time, bearing) {

      addDetection(time, 'Heading', bearing, '5'); // time, name, bearing, width

    }

    function addDetection(time, seriesName, bearing, strength){

      var k = widthk; // Width koeff

      // Split bearing into 2 points by given strength
      var bearingl = bearing - k*strength,
          bearingr = bearing + k*strength;

      // Time to plotter format
      var d = new Date("January 1, 1970 " +time);
      var t = d.getTime(); 

      // Get plot data
      var plData = plot.data;

      var notfound = true,
          timeDelta;

      // Search by label wether seriesName exists in current plot data
      for (var i=0;i<plData.length;i++) {

        if (plData[i].label == seriesName) {

          // Update points
          plot.data[i].push([bearing, t]); // 

          // Update bands with new strength
          bandsData[i-1].push([bearingl, bearingr]);
          var bData = bandsData[i-1];
          // finally set it in options
          plot.options.series[i] = {rendererOptions: {bandData: bData}};

          // In order to move plot we need to increase it's borders in options
          timeDelta = t - plot.axes.yaxis.max; // time between last point in data and given time

          // Update plot options in order to move it
          plot.axes.yaxis.max += timeDelta;
          plot.options.axes.yaxis.max += timeDelta;
          plot.axes.yaxis.min += timeDelta;
          plot.options.axes.yaxis.min += timeDelta;
          
          // Save and update plot with new data 
          var pdd = plot.data;
          var poo = plot.options;
          plot.destroy();

          plot = $.jqplot('container', pdd, poo);

          notfound = false;

          break;
        } 
      }

      if (notfound) {

          // Add new points series to plot data
          var newSeries = [];
          newSeries.push([bearing, t]);
          plot.data.push(newSeries);

          // Set new series Label
          plot.data[i].label = seriesName;

          // Set bandsData
          var bd = [];
          bd.push([bearingl, bearingr]);
          // Bands for new series
          bandsData.push(bd);
          var bData = bandsData[i-1];
          // finally pass it to options object
          plot.options.series.push({rendererOptions: {bandData: bData}});

          // Set series color
          plot.options.seriesColors.push('#269246');

          // Update plot

          // In order to move plot we need to increase it's borders in options
          if (plData[i-1] != null) {

            timeDelta = t - plot.axes.yaxis.max; // time between last point in data and given time
            
          } else {

            timeDelta = 3000; // If no data before set timeDelta to 3s
          
          }

          // Update plot options to move it
          if (seriesName == 'Heading') { // If it's the very first time plot draws any data, we set initial boundaries for ~ 1 hour around Heading.
            plot.axes.yaxis.max = t + 5000;
            plot.options.axes.yaxis.max = t + 5000;
            plot.axes.yaxis.min = t - 3600000; // set plot Y-axis boundaries
            plot.options.axes.yaxis.min = t - 3600000; // set plot Y-axis boundaries


          } else { // All other new detections goes with delta

            plot.axes.yaxis.max += timeDelta;
            plot.options.axes.yaxis.max += timeDelta;
            plot.axes.yaxis.min += timeDelta;
            plot.options.axes.yaxis.min += timeDelta;

          } 

          // Save and update plot with new data
          var pdd = plot.data;
          var poo = plot.options;
          plot.destroy();

          plot = $.jqplot('container', pdd, poo);
         
      }
    }