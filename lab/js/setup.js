
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
//
// var CARTOCSS = [
//       'Map {',
//       '-torque-time-attribute: "date";',
//       '-torque-aggregation-function: "count(cartodb_id)";',
//       '-torque-frame-count: 760;',
//       '-torque-animation-duration: 15;',
//       '-torque-resolution: 2',
//       '}',
//       '#layer {',
//       '  marker-width: 3;',
//       '  marker-fill-opacity: 0.8;',
//       '  marker-fill: #FEE391; ',
//       '  comp-op: "lighten";',
//       '}'
//     ].join('\n');
//
//     var torqueLayer = new L.TorqueLayer({
//       user       : 'rfinfer',
//       table      : 'crash2011_2014v2',
//       cartocss: CARTOCSS
//     });
//     torqueLayer.addTo(app.map);
//     torqueLayer.play()

var heatLayer;
var allData;


// The initial query by which we map the geojson representation of a table
app.geojsonClient.execute("SELECT * FROM crash2011_2014v2") // 'LIMIT' should be added to the end of this line
  .done(function(data) {
    var heatLayerArray = data.features.map(function(feature){
        return feature.geometry.coordinates.reverse()
    	});
    //Leaflet heat setup
    heatLayer = L.heatLayer(
    	heatLayerArray, {radius: 25}).addTo(app.map);
      showProperLayers();
  })
  .error(function(errors) {

  });


//chartist setup
//this is the sql code to create the chart
//SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 GROUP BY crash_year ORDER BY crash_year
//SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 WHERE ped_count>0 GROUP BY crash_year ORDER BY crash_year
//SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 WHERE bicycle_count>0 GROUP BY crash_year ORDER BY crash_year

//CHART FOR ALL CRASHES
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




//allData.rows[0].count



//need to use set.SQL to filter between tabs: SELECT * FROM crash2011_2014v2 WHERE ped_count>0
//USING SET.SQL TO FILTER

var pointSubLayer;

//Setting interactivity breaks the points....
console.log("appmap",app.map);
var otherPointLayer;
var pointLayer = cartodb.createLayer(app.map, {
     user_name: 'rfinfer',
     type: 'cartodb',
     //interactivity: true,
     sublayers: [
       {
         cartocss: "#layer { marker-fill: #5642f4; }", //need to see if this should be filled in
         sql: "SELECT * FROM crash2011_2014v2", //what you want to show up originally
      //   interactivity: ['person_cou'],
       }
     ]

 }).addTo(app.map)
 .on('done', function(layer) {
   otherPointLayer = layer;
   pointSubLayer =  layer.getSubLayer(0);


   // WORK IN PROGRESS: Clicking on a point should call fillForm with appropriate data
   // Set interactivity
//   layer.setInteraction(true);

  //  //pointSubLayer.setInteraction(true);
  //  layer.on('featureClick',function(e, latlng, pos, data) {
  //     console.log(data);
  //   });


   // Automatically fill the form on the left from geojson response
// var fillForm = function(properties) {
//   $('#cartodb_id').val(properties.cartodb_id);
//   $('#name').val(properties.name);
//   $('#person_cou').val(properties.person_cou);
// };
    // L.geoJson(data, {
   //   onEachFeature: function(feature, layer) {
   //     layer.on('click', function() { fillForm(feature.properties); });
   //   }
   // }).addTo(app.map);

 //THIS BREAKS THE MAP??



   pointSubLayer.hide();
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


   }); //what you want to show up on the button
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

//   }).addTo(app.map).on('shown.bs.tab', function (e) {
//    layer.setInteraction(true);
//    $('a[data-toggle="tab"]').on(function(){
//      var target = $(e.target).attr("href") // activated tab
//      console.log("target");
//    })
//  }).on('error', function(error) {
//       console.log("some error occurred",error);
//   });

 //$('#style1').click(function() {
  //     layer.getSubLayer(0).setCartoCSS('#pacd_2011 { line-width: 5; line-color: #000; }');
  //   });

  //  layer.on('zoomend',function(e) {
  //    console.log(data);
  //  });

//USING ZOOMEND TO CHANGE BACK TO POINTS
app.map.on("zoomend", function (e) {showProperLayers(), console.log("ZOOMEND", e); })

var showProperLayers= function () {
  if (app.map.getZoom()<15){
    heatLayer.addTo(app.map);
    pointSubLayer.hide();
    console.log("showheatlaer");
  }  else {
    app.map.removeLayer(heatLayer);
    pointSubLayer.show();
    console.log("nawshowheatlaer");
  }

}
//subLayer1.hide();
