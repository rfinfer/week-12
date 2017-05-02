/* =================================
Carto/JS Interaction Lab

We've looked at a lot of technologies in this class but we've yet to see
an application that takes full advantage of the analytic capabilities of SQL
and PostGIS. Luckily, Carto maintains a library which makes this all
relatively easy.


Task 1: Find a dataset you'd like to play with
Any interesting and realistic dataset will do, though dense point-based
datasets will work best for the tasks below.


Task 2: Wire up the application below to your account and dataset
You'll know you're successful when reloading the page renders data to the
map. Keep in mind that extremely large datasets will crush your browser. In
such instances, it might be useful to add `LIMIT 50` to your SQL (this will
limit the response to the first 50 records).

Remember to try your queries out in the SQL console first. Once you've got
something that looks good, you can just copy and paste it below.


Task 3: Choose interesting columns to represent on the navigation panel
The application is currently designed to display the 'cartodb_id' and 'name'
fields of the features returned from Carto. While every table will have an id,
'name' is by no means a required column.


Task 4: Add an input element (of your choice) to filter the returned SQL
If the filter can be expected to dramatically reduce response sizes, consider
removing any `LIMIT` statements you might have added in Task 2.

Again: test this out in the SQL console!


Task 5: Try to break your application.
Enter data into your input element that you expect to break things. Try your
best to characterize any bugs you encounter.


Task 6: Handle errors encountered in Task 5


Stretch goals
1. Use one of the UI frameworks seen in a previous class to style your application

2. Use leaflet draw to construct a geometry that can be used within a SQL query
(Obligatory reminder to try this out in the SQL console)

3. Try to get aggregate data based on the spatial filter you've constructed.
HINT: you'll need a client whose format is 'json' rather than 'geojson' because
the response you'll get will not have any spatial data. Ask for help if you get stuck
on this one for 10 or 15 minutes.
(Obligatory reminder to try this out in the SQL console)

4. Once you're confident you have a path from Leaflet Draw to a SQL query,
console.log the aggregate data to prove you can materialize it programmatically

5. Create a modal (or other means of representation) which will spawn upon completion
of a Leaflet Draw geometry. Get this modal to neatly display aggregate information
from the geometry you've drawn.

6. Think about performance.
- Only ask for the columns you're interested in (this means avoiding 'SELECT *' in favor of 'SELECT field_1, field2')
- Add an index on `the_geom` and the other column(s) you filter by to ensure that lookups happen as quickly as possible
- If not using points, geometric simplification can dramatically reduce JSON payload size

==================================*/


/** Notice the use of L.Map here. This is an extension of an organizational strategy we've already discussed. */
var app = {
  apikey: "8aa0bfd58931875bd27eb556a286210717e4ea67",
  map: L.map('map', { drawcontrol:true, center: [39.952052, -75.164004], zoom: 13 }),
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

// var drawnItems = new L.FeatureGroup();
//    map.addLayer(drawnItems);
//    var drawControl = new L.Control.Draw({
//        edit: {
//            featureGroup: drawnItems
//        }
//    });
//    map.addControl(drawControl);
var allData;
// The initial query by which we map the geojson representation of a table
app.geojsonClient.execute("SELECT * FROM crash2011_2014v2") // 'LIMIT' should be added to the end of this line
  .done(function(data) {
    //allData = data;
    // L.geoJson(data, {
    //   onEachFeature: function(feature, layer) {
    //     layer.on('click', function() { fillForm(feature.properties); });
    //   }
    // }).addTo(app.map);


  //   var heatLayerArray = data.features.map(function(feature){
  //       return feature.geometry.coordinates.reverse()
  //   	});
  //   //Leaflet heat setup
  //   var heat = L.heatLayer(
  //   	heatLayerArray, {radius: 25}).addTo(app.map);
  // })
  // .error(function(errors) {

  });


//chartist setup
//this is the sql code to create the chart
//SELECT crash_year, count(*), sum(fatal_count) as fatal_count_sum, sum(maj_inj_count) as maj_inj_count_sum FROM crash2011_2014v2 GROUP BY crash_year ORDER BY crash_year


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
        offset: 60
      },
      axisY: {
        offset: 80,
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

// Automatically fill the form on the left from geojson response
var fillForm = function(properties) {
  $('#cartodb_id').val(properties.cartodb_id);
  $('#person_cou').val(properties.person_cou);
};


//need to use set.SQL to filter between tabs: SELECT * FROM crash2011_2014v2 WHERE ped_count>0
//USING SET.SQL TO FILTER
console.log("appmap",app.map);
var pointLayer = cartodb.createLayer(app.map, {
     user_name: 'rfinfer',
     type: 'cartodb',
     sublayers: [
       {
         cartocss: "#layer { marker-fill: pink; }", //need to see if this should be filled in
         sql: "SELECT * FROM crash2011_2014v2", //what you want to show up originally
       }
     ]

 }).addTo(app.map)
 .on('done', function(layer) {
   // Set interactivity
   layer.setInteraction(true);
   $('#Ped').click(function(){ //need to switch from tabs to buttons??
     console.log("ped button clicked");
     layer.getSubLayer(0).setSQL("SELECT * FROM crash2011_2014v2 WHERE ped_count>0");
      layer.getSubLayer(0).setCartoCSS("#layer { marker-fill: red;}")
   });
   $('#Bike').click(function(){
     console.log("bike button clicked");
     layer.getSubLayer(0).setSQL("SELECT * FROM crash2011_2014v2 WHERE bicycle_count>0");
     layer.getSubLayer(0).setCartoCSS("#layer { marker-fill: blue;}")

   }); //what you want to show up on the button
   $('#All').click(function(){
     console.log("all button clicked");
     layer.getSubLayer(0).setSQL("SELECT * FROM crash2011_2014v2");
        layer.getSubLayer(0).setCartoCSS("#layer { marker-fill: pink;}")
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
// map.on('zoomend',(function(e) {
// map.removeLayer(heatLayer);

//});
//zoom_based_layer_change();
//function zoom_based_layerchange() {
