// creates the map, passing your access token to associate it with your Mapbox account, and setting the container, initial center, and zoom level

const API_TOKEN =
  'pk.eyJ1IjoiZGFybWFuc2siLCJhIjoiY21xN3I4b2dvMDJkMTJ1cXF3anF1cGczMSJ9.4_ylGpNv-pjRe0LYfmmd-g';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

function successLocation(position) {
  console.log(position.coords);
  setupMap([position.coords.longitude, position.coords.latitude]);
}
function errorLocation(position) {
  setupMap([36.232845, 49.988358]);
}
function setupMap(center) {
  const map = new mapboxgl.Map({
    accessToken: API_TOKEN,
    container: 'map', // container ID
    center: center, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 15, // starting zoom
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

  var directions = new MapboxDirections({
    accessToken: API_TOKEN,
  });

  map.addControl(
    new MapboxDirections({
      accessToken: API_TOKEN,
    }),
    'top-left'
  );
}
