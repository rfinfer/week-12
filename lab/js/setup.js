
/** Notice the use of L.Map here. This is an extension of an organizational strategy we've already discussed. */
var app = {
  apikey: "8aa0bfd58931875bd27eb556a286210717e4ea67",
  map: L.map('map', { center: [39.952052, -75.164004], zoom: 13 }),
  geojsonClient: new cartodb.SQL({ user: 'rfinfer', format: 'geojson' }),
  jsonClient: new cartodb.SQL({ user: 'rfinfer', format: 'json' }),
  drawnItems: new L.FeatureGroup()
};


L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(app.map);


var heatLayer;
var allData;

//put this inside the click events
//keep track of previous one so you can delete it
//global variable to keep track of variables and change with button click

// The initial query by which we map the geojson representation of a table
app.geojsonClient.execute("SELECT * FROM crash2011_2014v2") // 'LIMIT' should be added to the end of this line
  .done(function(data) {
    var heatLayerArray = data.features.map(function(feature){
        return feature.geometry.coordinates.reverse()
    });
    //Leaflet heat setup
    heatLayer = L.heatLayer(heatLayerArray, {radius: 25, blur: 15})//.addTo(app.map);
    showProperLayers();
  })
  .error(function(errors) {

  });


//ALL CRASHES (ORIGINALLY ADDED TO THE MAP BUT NOW JUST WANT TO ADD ON THE ZOOMEND)
app.jsonClient.execute("SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 GROUP BY crash_year ORDER BY crash_year")
  .done(function(data) {
    allData = data;

    console.log(data)
    var fatalArray = allData.rows.map(function(feature){
      return feature.fatal_count_sum
    });
    console.log(fatalArray);

    var seriousArray = allData.rows.map(function(feature){
      return feature.maj_inj_count_sum
    });
    console.log(seriousArray);

    var totalArray = allData.rows.map(function(feature){
      return feature.count
    });
    console.log(totalArray);

new Chartist.Bar('.ct-chart', {
  labels: ['2011', '2012', '2013', '2014'],
  series: [
    //total = allData.rows.count
    //totalArray,
    //serious
    seriousArray,
    //fatal
    fatalArray
  ]
}, {
  seriesBarDistance: 5,
  axisX: {
    offset: 30
  },
  axisY: {
    offset: 30,
    high: 300,
    labelInterpolationFnc: function(value) {
      return value + ''
    },
    scaleMinSpace: 15
  }
});
})

.error(function(errors) {
console.log("barchart carto errors:", errors);
});


//SPEED LIMIT LAYER
// var speedLimitLayer = cartodb.createLayer(app.map, {
//      user_name: 'rfinfer',
//      type: 'cartodb',
//      sublayers: [
//        {
//          cartocss: '#layer { line-width: 1.5; line-color: red;}',
//          sql: "SELECT * FROM streets", //what you want to show up originally
//        }
//      ]
//
//  })
//  .addTo(app.map)
//  .on('done', function(layer){
//    console.log("we  did it");
//  })
//  .on('error', function(error) {
//    console.log("some error occurred",error);
// });

// line-color: ramp([speedlimit], (#fff7f3, #fde0dd, #fcc5c0, #fa9fb5, #f768a1, #dd3497, #ae017e, #7a0177, #49006a, red , #666666), ("25", "30", "35", "40", "45", "CLASS 1", "CLASS 2", "CLASS 3", "CLASS 4", "CLASS 12"), "=");}',

var pointSubLayer;



console.log("appmap",app.map);
var pointLayer = cartodb.createLayer(app.map, {
     user_name: 'rfinfer',
     type: 'cartodb',
     interactivity: true,
     sublayers: [
       {
         cartocss: "#layer { marker-fill: #5642f4; }", //need to see if this should be filled in
         sql: "SELECT * FROM crash2011_2014v2", //what you want to show up originally
         interactivity: ['person_count'],
       },
       {
         //cartocss: '#layer { line-width: 1.5; line-color: red;}',
         cartocss: '#layer {line-width: 1; line-opacity: 0.5;[speedlimit = "25"]{line-color: #6c2167;}}',
         sql: "SELECT * FROM streets", //what you want to show up originally
       }

      //  {
      //    cartocss: '#streets {line-width: 1.5;line-color: ramp([speedlimit], (#fff7f3, #fde0dd, #fcc5c0, #fa9fb5, #f768a1, #dd3497, #ae017e, #7a0177, #49006a, red , #666666), ("25", "30", "35", "40", "45", "CLASS 1", "CLASS 2", "CLASS 3", "CLASS 4", "CLASS 12"), "=");}',
      //    sql: "SELECT * FROM streets", //what you want to show up originally
      //    interactivity: false,
      //  }
     ]

 })
 .addTo(app.map)
 .on('done', function(layer) {
   //return;

   pointSubLayer =  layer.getSubLayer(0);
   pointSubLayer.setInteraction(true);
     layer.on('featureClick',function(e, latlng, pos, data) {
         console.log(data);
         $('#person_count').val(data.person_count);
   });




  // pointSubLayer.hide();
   //PED BUTTON
   $('#Ped').click(function(){
     console.log("ped button clicked");
     layer.getSubLayer(0).setSQL("SELECT * FROM crash2011_2014v2 WHERE ped_count>0");
     layer.getSubLayer(0).setCartoCSS("#layer { marker-fill: #5cc490;}")
      //CHART FOR PED CRASHES
      app.jsonClient.execute("SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 WHERE ped_count>0 GROUP BY crash_year ORDER BY crash_year")
        .done(function(data) {
          allData = data;

          console.log(data)
          var fatalPedArray = allData.rows.map(function(feature){
            return feature.fatal_count_sum
          });
          console.log(fatalPedArray);

          var seriousPedArray = allData.rows.map(function(feature){
            return feature.maj_inj_count_sum
          });
          console.log(seriousPedArray);

          var totalPedArray = allData.rows.map(function(feature){
            return feature.count
          });
          console.log(totalPedArray);
          new Chartist.Bar('.ct-chart', {
            labels: ['2011', '2012', '2013', '2014'],
        //     plugins: [
        //     Chartist.plugins.legend()
        // ],
            series: [
              //total = allData.rows.count
              //totalArray,
              //serious
              seriousPedArray,
              //fatal
              fatalPedArray
            ]
          }, {
            seriesBarDistance: 5,
            axisX: {
              offset: 30
            },
            axisY: {
              offset: 30,
              high: 100,
              labelInterpolationFnc: function(value) {
                return value + ''
              },
              scaleMinSpace: 15
            }
          });
      })

        .error(function(errors) {
          console.log("barchart carto errors:", errors);
        });



   });

  //BIKE CLICK EVENT
   $('#Bike').click(function(){
     console.log("bike button clicked");
     layer.getSubLayer(0).setSQL("SELECT * FROM crash2011_2014v2 WHERE bicycle_count>0");
     layer.getSubLayer(0).setCartoCSS("#layer { marker-fill: #45b7cc;}")
     app.jsonClient.execute("SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 WHERE bicycle_count>0 GROUP BY crash_year ORDER BY crash_year")
       .done(function(data) {
         allData = data;

         console.log(data)
         var fatalBikeArray = allData.rows.map(function(feature){
           return feature.fatal_count_sum
         });
         console.log(fatalBikeArray);

         var seriousBikeArray = allData.rows.map(function(feature){
           return feature.maj_inj_count_sum
         });
         console.log(seriousBikeArray);

         var totalArray = allData.rows.map(function(feature){
           return feature.count
         });
         console.log(totalArray);

     new Chartist.Bar('.ct-chart', {
       labels: ['2011', '2012', '2013', '2014'],
       series: [
         //total = allData.rows.count
         //totalArray,
         //serious
         seriousBikeArray,
         //fatal
         fatalBikeArray
       ]
     }, {
       seriesBarDistance: 5,
       axisX: {
         offset: 30
       },
       axisY: {
         offset: 30,
         high: 100,
         labelInterpolationFnc: function(value) {
           return value + ''
         },
         scaleMinSpace: 15
       }
     });
     })

     .error(function(errors) {
       console.log("barchart carto errors:", errors);
     });
   });

   //ALL CRASHES CLICK EVENT
   $('#All').click(function(){
     console.log("all button clicked");
     layer.getSubLayer(0).setSQL("SELECT * FROM crash2011_2014v2");
        layer.getSubLayer(0).setCartoCSS("#layer { marker-fill: #5642f4;}")
        app.jsonClient.execute("SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 GROUP BY crash_year ORDER BY crash_year")
          .done(function(data) {
            allData = data;

            console.log(data)
            var fatalArray = allData.rows.map(function(feature){
              return feature.fatal_count_sum
            });
            console.log(fatalArray);

            var seriousArray = allData.rows.map(function(feature){
              return feature.maj_inj_count_sum
            });
            console.log(seriousArray);

            var totalArray = allData.rows.map(function(feature){
              return feature.count
            });
            console.log(totalArray);

        new Chartist.Bar('.ct-chart', {
          labels: ['2011', '2012', '2013', '2014'],
          series: [
            //total = allData.rows.count
            //totalArray,
            //serious
            seriousArray,
            //fatal
            fatalArray
          ]
        }, {
          seriesBarDistance: 5,
          axisX: {
              offset: 30
            },
            axisY: {
              offset: 30,
              high: 300,
            labelInterpolationFnc: function(value) {
              return value + ''
            },
            scaleMinSpace: 15
          }
        });
        })

        .error(function(errors) {
        console.log("barchart carto errors:", errors);
        });

   })
 }).on('error', function(error) {
    console.log("some error occurred",error);
});

//USING ZOOMEND TO CHANGE BACK TO POINTS
app.map.on("zoomend", function (e) {
  console.log("ZOOMEND", e);
  showProperLayers();
});

var showProperLayers= function () {
  if (app.map.getZoom()<15){
    heatLayer.addTo(app.map);
    //pointSubLayer.hide();
    console.log("showHeatLayer");
  }  else {
    app.map.removeLayer(heatLayer);
    pointLayer.addTo(app.map);
//getting an error says pointSubLayer isn't a function?
    console.log("pointLayer", pointLayer);
    console.log("appmap",app.map);
    console.log("nowShowpointLayer");
  }

};
//subLayer1.hide();

// var showPointLayer = function() {
// console.log("pointLayer1:", pointLayer);
// pointLayer.addTo(app.map);

// }
