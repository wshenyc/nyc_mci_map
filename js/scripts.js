mapboxgl.accessToken = 'pk.eyJ1Ijoid3NoZW55YyIsImEiOiJja2w3YjNvd3YxZnc1Mm5wZWp1MnVqZGh2In0.-wG4LWFGN76Nf-AEigxu2A';

var map = new mapboxgl.Map({
  container: 'mapContainer', // container ID
  style: 'mapbox://styles/mapbox/light-v9', // style URL
  center: [-73.992075979463, 40.7367347085187], // starting position [lng, lat]
  zoom: 14.5 // starting zoom
});

// disable map zoom when using scroll
map.scrollZoom.disable();

// add navigation control in top right
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

//Target the span elements used in the sidebar
var addDisplay = document.getElementById('address');
var itemDisplay = document.getElementById('item');
var amountDisplay = document.getElementById('mciamount');
var dateDisplay = document.getElementById('mcidate');

map.on('load', function() {

  // adding base layer of all Manhattan lots

  map.addSource('manhattanlots', {
    type: 'geojson',
    data: '/data/manhattan_lots_all.geojson'
  });

  map.addLayer({
    'id': 'manhattan-all-lots',
    'type': 'fill',
    'source': 'manhattanlots',
    'paint': {
      'fill-color': 'green',
      'fill-opacity': 0.5
    }
  });

  // add outlines for all lots
  map.addLayer({
    'id': 'lots-outlines',
    'type': 'line',
    'source': 'manhattanlots',
    'paint': {
      'line-color': 'white',
      'line-width': 0.2
    }
  });


  // adding in layer of just lots with MCIs

  map.addSource('mcilots', {
    type: 'geojson',
    data: '/data/mci_manhattan_only.geojson'
  });

  map.addLayer({
    'id': 'manhattan-mci-lots',
    'type': 'fill',
    'source': 'mcilots',
    'paint': {
      'fill-color': 'red'
    }
  });

  // add outlines for all MCI lots
  map.addLayer({
    'id': 'mci-outlines',
    'type': 'line',
    'source': 'mcilots',
    'paint': {
      'line-color': '#4b0000',
      'line-width': 1
    }
  });
  });


//   var quakeID = null;
//
//   map.on('click', 'unclustered-point', function (e) {
//     // Set variables equal to the current feature's magnitude, location, and time
//     var quakeMagnitude = e.features[0].properties.mag;
//     var quakeLocation = e.features[0].properties.place;
//     var quakeDate = new Date(e.features[0].properties.time);
//
//     if (e.features.length > 0) {
//       // Display the magnitude, location, and time in the sidebar
//       magDisplay.textContent = quakeMagnitude;
//       locDisplay.textContent = quakeLocation;
//       dateDisplay.textContent = quakeDate;
//
//       // When the mouse moves over the earthquakes-viz layer, update the
//       // feature state for the feature under the mouse
//       if (quakeID) {
//         map.removeFeatureState({
//           source: 'earthquakes',
//           id: quakeID
//         });
//       }
//
//       quakeID = e.features[0].id;
//
//       map.setFeatureState(
//         {
//           source: 'earthquakes',
//           id: quakeID
//         },
//         {
//           hover: true
//         }
//       );
//     }
//   });
//
//   // When the mouse leaves the earthquakes-viz layer, update the
//   // feature state of the previously hovered feature
//   map.on('mouseleave', 'earthquakes-viz', function () {
//     if (quakeID) {
//       map.setFeatureState(
//         {
//           source: 'earthquakes',
//           id: quakeID
//         },
//         {
//           hover: false
//         }
//       );
//     }
//     quakeID = null;
//     // Remove the information from the previously hovered feature from the sidebar
//     magDisplay.textContent = '';
//     locDisplay.textContent = '';
//     dateDisplay.textContent = '';
//     // Reset the cursor style
//     map.getCanvas().style.cursor = '';
//   });
// });
