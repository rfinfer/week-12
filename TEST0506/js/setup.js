
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



var allData;

//put this inside the click events
//keep track of previous one so you can delete it
//global variable to keep track of variables and change with button click

// The initial query by which we map the geojson representation of a table
//ALL CRASHES (ORIGINALLY ADDED TO THE MAP BUT NOW JUST WANT TO ADD ON THE ZOOMEND)

var pointSubLayer;

console.log("appmap",app.map);
var pointLayer = cartodb.createLayer(app.map, {
     user_name: 'rfinfer',
     type: 'cartodb',
    //  interactivity: true,
     sublayers: [
       {
         cartocss: "#layer { marker-fill: #5642f4; }", //need to see if this should be filled in
         sql: "SELECT * FROM crash2011_2014v2", //what you want to show up originally
         //interactivity: ['person_count'],
       }
     ]
 })
 //.addTo(app.map)

//USING ZOOMEND TO CHANGE BACK TO POINTS
//app.map.on("zoomend", function (e) {showProperLayers(), console.log("ZOOMEND", e); })

// var showProperLayers= function () {
//   if (app.map.getZoom()<15){
//     //heatLayer.addTo(app.map);
//     //pointSubLayer.hide();
//
//     // console.log("showHeatLayer");
//   }  else {
//     //app.map.removeLayer(heatLayer);
//     pointLayer.addTo(app.map);
// //getting an error says pointSubLayer isn't a function?
//     console.log("pointLayer", pointLayer);
//     console.log("appmap",app.map);
//     console.log("nowShowpointLayer");
//   }
//};

console.log("pointLayer1:", pointLayer);
// pointLayer.addTo(app.map);

function addPointLayer(){
  console.log("addPointLayer:", pointLayer);
  console.log("app.map:", app.map);
  pointLayer.addTo(app.map).done( console.log("added to map"))

}

//addPointLayer()
