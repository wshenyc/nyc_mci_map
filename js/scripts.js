//Intro overlay from w3schools

function openIntro() {
  document.getElementById("myIntro").style.height = "100%";
  document.querySelector('body').style.overflow = 'hidden';
}

function closeIntro() {
  document.getElementById("myIntro").style.height = "0%";
  document.querySelector('body').style.overflow = 'auto';
}


mapboxgl.accessToken = 'pk.eyJ1Ijoid3NoZW55YyIsImEiOiJja2w3YjNvd3YxZnc1Mm5wZWp1MnVqZGh2In0.-wG4LWFGN76Nf-AEigxu2A';

var map = new mapboxgl.Map({
  container: 'mapContainer', // container ID
  style: 'mapbox://styles/mapbox/light-v9', // style URL
  center: [-73.992075979463, 40.7367347085187], // starting position [lng, lat]
  zoom: 13.5 // starting zoom
});

// disable map zoom when using scroll
map.scrollZoom.disable();

// add navigation control in top right
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');


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


 function set_ad() {
  var select = document.getElementById("assembly_district");
  var ad = select.options[select.selectedIndex].value;
  // var features = map.queryRenderedFeatures({
  // layers: ['manhattan-mci-lots']});

  map.setFilter('manhattan-mci-lots',
  ['==', ['get', 'mci_manhattan_geo_assemblyDistrict'], ad]
)

  map.setFilter('mci-outlines',
  ['==', ['get', 'mci_manhattan_geo_assemblyDistrict'], ad]
)

  map.setLayoutProperty('manhattan-all-lots', 'visibility', 'none');

}


//Target the span elements used in the sidebar
var addDisplay = document.getElementById('address');
var itemDisplay = document.getElementById('item');
var amountDisplay = document.getElementById('mciamount');
var dateDisplay = document.getElementById('mcidate');


var buildingID = null;

map.on('click', 'manhattan-mci-lots', function (e) {
  // Set variables equal to the current feature's magnitude, location, and time
  var address = e.features[0].properties.mci_manhattan_geo_street_address;
  var mciItem = e.features[0].properties.mci_manhattan_geo_mci_item;
  var mciAmount = e.features[0].properties.mci_manhattan_geo_claim_cost;
  var mciDate = e.features[0].properties.mci_manhattan_geo_filing_date;

  if (e.features.length > 0) {
    // Display the magnitude, location, and time in the sidebar
    addDisplay.textContent = address;
    itemDisplay.textContent = mciItem;
    amountDisplay.textContent = mciAmount;
    dateDisplay.textContent = mciDate;


  }
});

//Mouse cursor will change to a pointer when over something clickable
map.on('mouseenter', 'manhattan-mci-lots', function () {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'manhattan-mci-lots', function () {
  map.getCanvas().style.cursor = '';
});
