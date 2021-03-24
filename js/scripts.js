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

  // adding base layer of all Manhattan NTAs

  map.addSource('manhattannta', {
    type: 'geojson',
    data: './data/nta-nyc.geojson'
  });


  // add outlines for all NTAs
  map.addLayer({
    'id': 'lots-outlines',
    'type': 'line',
    'source': 'manhattannta',
    'filter': ['==', 'BoroName', 'Manhattan'],
    'paint': {
      'line-color': 'gray',
      'line-width': 2
    }
  });


  // adding in layer of just lots with MCIs

  map.addSource('mcilots', {
    type: 'geojson',
    data: './data/mci-final-v4.geojson'
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

//filter map by NTA
function set_nta() {
  var select = document.getElementById("nta_code");
  var nta = select.options[select.selectedIndex].value;


  map.setFilter('manhattan-mci-lots',
  ['==', ['get', 'nta'], nta]
)

  map.setFilter('mci-outlines',
  ['==', ['get', 'nta'], nta]
)

  map.setFilter('lots-outlines',
  ['==', ['get', 'NTACode'], nta]
)

}


//reset map
function resetMap() {
  map.setFilter('manhattan-mci-lots')

  map.setFilter('mci-outlines')

  map.setFilter('lots-outlines',
  ['==', 'BoroName', 'Manhattan'])
}

// zoom the map to the selected features



//Target the span elements used in the sidebar
var addDisplay = document.getElementById('address');
var itemDisplay = document.getElementById('item');
var amountDisplay = document.getElementById('mciamount');
var allowCostDisplay = document.getElementById('allowcost')
var statusDisplay = document.getElementById('finaldecision');
var dateDisplay = document.getElementById('mcidate');
var closingDateDisplay = document.getElementById('closingdate');


var buildingID = null;

map.on('click', 'manhattan-mci-lots', function (e) {
  // Set variables equal to the current feature's address, MCI item, claim cost, filing date
  var address = e.features[0].properties.full_address;
  var mciItem = e.features[0].properties.mci_item;
  var mciAmount = e.features[0].properties.claim_cost;
  var allowedCost = e.features[0].properties.allow_cost;
  var finalDecision = e.features[0].properties.close_code;
  var mciDate = e.features[0].properties.filing_date;
  var closingDate = e.features[0].properties.closing_date;
  var existingAddress = [];

  if (e.features.length > 0) {
    // Display theaddress, MCI item, claim cost, filing date in the sidebar


//trying to make it list all the mcis for each building
//this is hard to read though. maybe if I can also add like tabs for each MCI item?
    var i;
    for (i = 0; i < e.features.length; i++) {
      existingAddress.push(address);

      console.log(existingAddress);

      if (existingAddress.includes(address)) {
        addDisplay.textContent = address;
        itemDisplay.textContent = mciItem + ", " + e.features[i+1].properties.mci_item;
        amountDisplay.textContent = mciAmount + ", " + e.features[i+1].properties.claim_cost;
        allowCostDisplay.textContent = allowedCost + ", " + e.features[i+1].properties.allow_cost;
        statusDisplay.textContent = finalDecision + ", " + e.features[i+1].properties.close_cost;
        dateDisplay.textContent = mciDate +  ", " + e.features[i+1].properties.filing_date;
        closingDateDisplay.textContent = closingDate +  ", " + e.features[i+1].properties.closing_date;
      }
      else {
        addDisplay.textContent = address;
        itemDisplay.textContent = mciItem;
        amountDisplay.textContent = mciAmount;
        allowCostDisplay.textContent = allowedCost;
        statusDisplay.textContent = finalDecision;
        dateDisplay.textContent = mciDate;
        closingDateDisplay.textContent = closingDate;
      }
    }

  }

});

//Mouse cursor will change to a pointer when over something clickable
map.on('mouseenter', 'manhattan-mci-lots', function () {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'manhattan-mci-lots', function () {
  map.getCanvas().style.cursor = '';
});
