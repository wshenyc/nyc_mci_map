//Intro overlay

function openIntro() {
  document.getElementById("myIntro").style.height = "100%";
  document.querySelector('body').style.overflow = 'hidden';
}

function closeIntro() {
  document.getElementById("myIntro").style.height = "0%";
  document.querySelector('body').style.overflow = 'auto';
}

// load final data initially so page doesn't lag when
// selecting neighborhoods
var MCI_FINAL_DATA = [];
$.getJSON("./data/mci-final-v4.geojson", function(data) {
  MCI_FINAL_DATA = data
})


mapboxgl.accessToken = 'pk.eyJ1Ijoid3NoZW55YyIsImEiOiJja2w3YjNvd3YxZnc1Mm5wZWp1MnVqZGh2In0.-wG4LWFGN76Nf-AEigxu2A';

//loading map
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

//Target the span element used in the sidebar
var addDisplay = document.getElementById('address');

map.on('click', 'manhattan-mci-lots', function(e) {
  // Set variables equal to the current feature's address, MCI item, claim cost, filing date



  var address = e.features[0].properties.full_address;

  if (e.features.length > 0) {
    var MCIElements = e.features.map((feature, idx) => {
      var {
        properties
      } = feature;
      return `<div>
        <h3 class="mciItemHeader" style="${idx === 0 ? 'padding-top:0' : ''}">
          ${properties.mci_item.toLowerCase() === 'na' ? 'Item Unknown' : properties.mci_item}
        </h3>
        <div>
          <strong>Claim Cost:</strong>&nbsp;
          <span id="mciamount">${properties.claim_cost.toLowerCase() === 'na' ? 'Amount Unknown' :numberWithCommas(properties.claim_cost)}</span>
        </div>
        <div>
          <strong>Amount Granted:</strong>&nbsp;
          <span id="allowcost">${properties.allow_cost.toLowerCase() === 'na' ? 'Amount Unknown' :numberWithCommas(properties.allow_cost)}</span>
        </div>
        <div>
          <strong>Filing Date:</strong>&nbsp;
          <span id="mcidate">${properties.filing_date}</span>
        </div>
        <div>
          <strong>Closing Date:</strong>&nbsp;
          <span id="closingdate">${properties.closing_date}</span>
        </div>
      </div>`
    });
    addDisplay.textContent = address;
    infoContainer.innerHTML = MCIElements.join('');
  }
});

//filter map by NTA
function set_nta() {
  var select = document.getElementById("nta_code");
  var nta = select.options[select.selectedIndex].value;

  if (nta === 'reset') {

  } else {
  //filtering layers based on selected NTA
  map.setFilter('manhattan-mci-lots',
    ['==', ['get', 'nta'], nta]
  )
  map.setFilter('mci-outlines',
    ['==', ['get', 'nta'], nta]
  )
  map.setFilter('lots-outlines',
    ['==', ['get', 'NTACode'], nta]
  )


  //using helper function below to display aggregated data for the NTA
  getAndDisplayMCIAverages(MCI_FINAL_DATA, nta)

  //Zoom to selected NTA
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

  //display aggregated Data
  document.getElementById("NTA_info").style.visibility = "visible";
}
}


//reset map
function resetMap() {

  //resets layers back to original
  map.setFilter('manhattan-mci-lots')

  map.setFilter('mci-outlines')

  map.setFilter('lots-outlines',
    ['==', 'BoroName', 'Manhattan'])

  //removes content in info container
  addDisplay.textContent = "";
  infoContainer.innerHTML = "";

  //removes aggregate window

  document.getElementById("NTA_info").style.visibility = "hidden";

  //shifts map back to starting center and zoom level
  map.easeTo({
    center: [-73.992075979463, 40.7367347085187], // starting position [lng, lat]
    zoom: 13.5 // starting zoom
  })

  //reset dropdown menu
  document.getElementById("nta_code").selectedIndex = 0;
}

// helpers

//loops through the buildings in the selected NTAs and
//averages all the corresponding claim/allow cost as well as
//finds the most common MCI item

function getAndDisplayMCIAverages(data, nta) {
  var nbhood = data.features.filter(function(feature) {
    return feature.properties.nta === nta;
  });
  var totalClaimCost = 0
  var totalAllowCost = 0
  var totalClaimCount = 0
  var totalAllowCount = 0;
  var mciItems = {}
  nbhood.forEach(building => {
    if (!isNaN(parseFloat(building.properties.claim_cost))) {
      totalClaimCost += parseFloat(building.properties.claim_cost);
      totalClaimCount += 1
    }
    if (!isNaN(parseFloat(building.properties.allow_cost))) {
      totalAllowCost += parseFloat(building.properties.allow_cost);
      totalAllowCount += 1
    }

    if (building.properties.mci_item) {
      if (mciItems[building.properties.mci_item]) {
        mciItems[building.properties.mci_item] += 1
      } else {
        mciItems[building.properties.mci_item] = 1
      }
    }
  })

  var avgClaimCost = roundNumber(totalClaimCost / totalClaimCount)
  var avgAllowCost = roundNumber(totalAllowCost / totalAllowCount)

  //displays the most popular MCI item as well as how often it occurs
  var mostPopular = '';
  var highestCount = 0;
  Object.keys(mciItems).forEach(key => {
    if (key.toLowerCase() === 'na' || key.toLowerCase() === 'n/a') return
    if (mciItems[key] > highestCount) {
      highestCount = mciItems[key]
      mostPopular = key
    }
  })
  document.getElementById('commonItem').textContent = `${mostPopular} (${highestCount})`
  document.getElementById('averageClaim').textContent = numberWithCommas(avgClaimCost);
  document.getElementById('averageGrant').textContent = numberWithCommas(avgAllowCost);
}

//rounding off numbers to the last 2 decimal points
function roundNumber(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

//adding a dollar sign and commas in the thousands place
function numberWithCommas(x) {
  return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

//Mouse cursor will change to a pointer when over something clickable
map.on('mouseenter', 'manhattan-mci-lots', function() {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'manhattan-mci-lots', function() {
  map.getCanvas().style.cursor = '';
});
