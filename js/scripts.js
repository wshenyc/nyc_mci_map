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


  //going to add a zoom to NTA here


  $.getJSON("./data/nta-nyc.geojson", function(data) {
      var neighborhood = data.features.find(function(feature) {
        return feature.properties.NTACode === nta;
      });
      // nta data is formatted inconsistently, so ensure it's
      // broken down to the format [[lng, lat], [lng, lat]]
      var coords = flatten(neighborhood.geometry.coordinates)

      var turfFeatures = turf.points(coords);
      var newCenter = turf.center(turfFeatures);
      map.flyTo({
        center: newCenter.geometry.coordinates,
        zoom: 14,
        speed: 1
      })
    })
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

map.on('click', 'manhattan-mci-lots', function(e) {
  // Set variables equal to the current feature's address, MCI item, claim cost, filing date
  var address = e.features[0].properties.full_address;
  var mciItem = e.features[0].properties.mci_item;
  var mciAmount = e.features[0].properties.claim_cost;
  var allowedCost = e.features[0].properties.allow_cost;
  var finalDecision = e.features[0].properties.close_code;
  var mciDate = e.features[0].properties.filing_date;
  var closingDate = e.features[0].properties.closing_date;

  var mciItemList = [];
  var mciAmountList =[];
  var allowedCostList = [];
  var finalDecisionList = [];
  var mciDateList = [];
  var closingDateList = [];


  if (e.features.length > 0) {
    // Display theaddress, MCI item, claim cost, filing date in the sidebar

    addDisplay.textContent = address;
    itemDisplay.textContent = mciItem;
    amountDisplay.textContent = mciAmount;
    allowCostDisplay.textContent = allowedCost;
    statusDisplay.textContent = finalDecision;
    dateDisplay.textContent = mciDate;
    closingDateDisplay.textContent = closingDate;
    //trying to make it list all the mcis for each building
    //this is hard to read though. maybe if I can also add like tabs for each MCI item?

    for (var i = 0; i < e.features.length; i++) {
      if (address == e.features[i].properties.full_address) {
        mciItemList.push(e.features[i].properties.mci_item);
        mciAmountList.push(e.features[i].properties.mci_amount);
        allowedCostList.push(e.features[i].properties.allow_cost);
        finalDecisionList.push(e.features[i].properties.close_code);
        mciDateList.push(e.features[i].properties.filing_date);
        closingDateList.push(e.features[i].properties.closing_date);
      } else {
        addDisplay.textContent = address;
        itemDisplay.textContent = mciItem;
        amountDisplay.textContent = mciAmount;
        allowCostDisplay.textContent = allowedCost;
        statusDisplay.textContent = finalDecision;
        dateDisplay.textContent = mciDate;
        closingDateDisplay.textContent = closingDate;
      }
    }
    itemDisplay.textContent = mciItemList;
    amountDisplay.textContent = mciAmountList;
    allowCostDisplay.textContent = allowedCostList;
    statusDisplay.textContent = finalDecisionList;
    dateDisplay.textContent = mciDateList;
    closingDateDisplay.textContent = closingDateList;
  }

});


// recursive array flattener, return array of arrays, in geojson formatt,
// i.e. [[lng, lat], [lng, lat]]
function flatten(array) {
  if (array[0] instanceof Array) {
    if (!(array[0][0] instanceof Array)) {
      return array
    }
  }
  var newArray = []
  array.forEach(el => newArray = [...newArray, ...el])
  return flatten(newArray)
}
//filter feature by Address
// var filterEl = document.getElementById('feature-filter');
// var listingEl = document.getElementById('feature-listing');
//
// filterEl.parentNode.style.display = 'block';
// }
// else if (features.length === 0 && filterEl.value !== '') {
//   empty.textContent = 'No results found';
//   listingEl.appendChild(empty);
// } else {
//   empty.textContent = 'Drag the map to populate results';
//   listingEl.appendChild(empty);
//
//   // Hide the filter input
//   filterEl.parentNode.style.display = 'none';


//Mouse cursor will change to a pointer when over something clickable
map.on('mouseenter', 'manhattan-mci-lots', function() {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'manhattan-mci-lots', function() {
  map.getCanvas().style.cursor = '';
});
