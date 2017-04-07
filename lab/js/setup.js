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
  apikey: "3a5ff146a6e40b37b835932405e7417d7154d587",
  map: L.map('map', { center: [40.75583970971843, -73.795166015625], zoom: 11 }),
  geojsonClient: new cartodb.SQL({ user: 'moradology', format: 'geojson' }),
  drawnItems: new L.FeatureGroup()
};

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(app.map);

// The initial query by which we map the geojson representation of a table
app.geojsonClient.execute("SELECT * FROM world_borders") // 'LIMIT' should be added to the end of this line
  .done(function(data) {
    L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        layer.on('click', function() { fillForm(feature.properties); });
      }
    }).addTo(app.map);
  })
  .error(function(errors) {
  });

// Leaflet draw setup
app.map.addLayer(app.drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
app.map.addControl(
  new L.Control.Draw({
    edit: {
      featureGroup: app.drawnItems
    },
    draw: {
      rectangle: false,
      polyline: false,
      polygon: false,
      marker: false,
      circle: false
    }
  })
);

// Automatically fill the form on the left from geojson response
var fillForm = function(properties) {
  $('#cartodb_id').val(properties.cartodb_id);
  $('#name').val(properties.name);
};

// Handling the creation of Leaflet.Draw layers
// Note the use of drawnLayerID - this is the way you should approach remembering and removing layers
var drawnLayerID;
app.map.on('draw:created', function (e) {
  var type = e.layerType;
  var layer = e.layer;
  console.log('draw created:', e);
});
