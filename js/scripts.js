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

  map.easeTo({
    center: [-73.992075979463, 40.7367347085187], // starting position [lng, lat]
    zoom: 13.5 // starting zoom
  })
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
var infoContainer = document.getElementById('infoContainer');


var buildingID = null;

map.on('click', 'manhattan-mci-lots', function(e) {
  // Set variables equal to the current feature's address, MCI item, claim cost, filing date
  var address = e.features[0].properties.full_address;


  if (e.features.length > 0) {
    // Display the address, MCI item, claim cost, filing date in the sidebar
    var MCIElements = e.features.map((feature, idx) => {
      var { properties } = feature;
      return `<div>
        <h3 class="mciItemHeader" style="${idx === 0 ? 'padding-top:0' : ''}">
          ${properties.mci_item.toLowerCase() === 'na' ? 'Item Unknown' : properties.mci_item}
        </h3>
        <div>
          <strong>Claim Cost:</strong>&nbsp;
          <span id="mciamount">${properties.claim_cost}</span>
        </div>
        <div>
          <strong>Amount Granted:</strong>&nbsp;
          <span id="allowcost">${properties.allow_cost}</span>
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
    infoContainer.innerHTML =  MCIElements.join('');
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
