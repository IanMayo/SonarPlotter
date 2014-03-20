  var plot;
  var seriesPairs = [];
  var bandsData = [];
  var widthk = 1;

  function initPlotter(){

      // set initial options

      var options = {

        sortData: false,

        seriesDefaults:{
                //lineWidth: 0.5,
                shadow: false,
                markerOptions: {
                  show: true
                },
                rendererOptions: {
                    highlightMouseDown: true   
                },

            },

        series: [
        {
          rendererOptions: { 

            //bands: { show: true,  interval: '10%'},
            //bandData: bdat,
            //smooth: true,  Does not work for vertical Graph!

          },
        }],

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

    // Fill between series to show width.
    // Id's of the series to be filled and selected are stored in seriesPairs array.
    //
    // Function below is used in plot options draw hooks. Each time plot draws it iterates over seriesPairs 
    // and uses 'fillseries' to fill series and draw selections


    //////////////////
    // api functions

    function clearPlotter() {

      var pOptions = plot.options;
      plot = $.jqplot('container', [[null]], pOptions);

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

      var k = widthk; // Width koeff

      // Split bearing into 2 points
      var bearingl = bearing - k*strength,
          bearingr = bearing + k*strength;

      // Time to plotter format
      var d = new Date("January 1, 1970 " +time);
      //console.log('d: ', d);
      var t = d.getTime(); 
      //console.log('t: ', t);

      // Get plot data
      var plData = plot.data;

      var notfound = true,
          timeDelta;

      // Search wether seriesName exists in current plot data
      for (var i=0;i<plData.length;i++) {

        if (plData[i].label == seriesName) {

          // Update points
          plot.data[i].push([bearing, t]); // 

          bandsData[i-1].push([bearingl, bearingr]);
          //var bData = bandsData[i-1];
          console.log(bandsData);
          //plot.options.series.push({rendererOptions: {bandData: bData}});

          // get current axes
          var axes = plot.axes;

          // In order to move plot we need to increase it's borders in options
          timeDelta = t - axes.yaxis.max; // time between last point in data and given time

          // Update plot options to move it
          plot.axes.yaxis.max += timeDelta;
          plot.options.axes.yaxis.max += timeDelta;
          plot.axes.yaxis.min += timeDelta;
          plot.options.axes.yaxis.min += timeDelta;
                
          var pdd = plot.data;
          var poo = plot.options;
          plot.destroy();

          plot = $.jqplot('container', pdd, poo);

          notfound = false;

          break;
        } 
      }

      if (notfound) {

          var bd = [];
          bd.push([bearingl, bearingr]);

          // Add new data
          var newSeries = [];
          
          newSeries.push([bearing, t]);

          plot.data.push(newSeries);

          // Set new series Label
          plot.data[i].label = seriesName;

          // Trying to set bandsData
          var i = plData.length-1;

          bandsData.push(bd);

          var bData = bandsData[i-1];
          //console.log(bData);
          plot.options.series.push({rendererOptions: {bandData: bData}});

         
          // Update plot

          // get current axes
          var axes = plot.axes;

          // In order to move plot we need to increase it's borders in options
          if (plData[i-1] != null) {

            timeDelta = t - axes.yaxis.max; // time between last point in data and given time
            
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

          var pdd = plot.data;
          var poo = plot.options;
          plot.destroy();

          plot = $.jqplot('container', pdd, poo);
         
      }
    }