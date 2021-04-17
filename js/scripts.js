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
$.getJSON("./data/final_all_mci.geojson", function(data) {
  MCI_FINAL_DATA = data
})


mapboxgl.accessToken = 'pk.eyJ1Ijoid3NoZW55YyIsImEiOiJja2w3YjNvd3YxZnc1Mm5wZWp1MnVqZGh2In0.-wG4LWFGN76Nf-AEigxu2A';

//loading map
var map = new mapboxgl.Map({
  container: 'mapContainer', // container ID
  style: 'mapbox://styles/mapbox/light-v9', // style URL
  center: [-73.92013728138733, 40.71401732482218,], // starting position [lng, lat]
  zoom: 10.5 // starting zoom
});

// disable map zoom when using scroll
map.scrollZoom.disable();

// add navigation control in top right
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');


//search bar

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
});

map.addControl(geocoder);

map.on('load', function() {

  // adding base layer of all NYC NTAs
  map.addSource('allnta', {
    type: 'geojson',
    data: './data/nta-nyc.geojson'
  });


  // add outlines for all NTAs
  map.addLayer({
    'id': 'lots-outlines',
    'type': 'line',
    'source': 'allnta',
    'paint': {
      'line-color': 'gray',
      'line-width': 2
    }
  });

  // adding in layer of just lots with MCIs
  map.addSource('mcilots', {
    type: 'geojson',
    data: './data/final_all_mci.geojson'
  });

  map.addLayer({
    'id': 'mci-lots',
    'type': 'fill',
    'source': 'mcilots',
    'paint': {
      'fill-color': '#C42021'
    }
  });

  // add outlines for all MCI lots
  map.addLayer({
    'id': 'mci-outlines',
    'type': 'line',
    'source': 'mcilots',
    'paint': {
      'line-color': '#1a1a1a',
      'line-width': 1
    }
  });

  // add outlines for selected lots
  map.addSource('highlight-feature', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': []
    }
  });

  map.addLayer({
    'id': 'highlight-fill',
    'type': 'fill',
    'source': 'highlight-feature',
    'paint': {
      'fill-color': '#eacf47 '
    }
  });

  map.addLayer({
    'id': 'highlight-outline',
    'type': 'line',
    'source': 'highlight-feature',
    'paint': {
      'line-width': 3,
      'line-opacity': 1,
      'line-color': '#e83553'
    },
    'layout': {
      'line-join': 'bevel'
    }
  });

});

//Target the span element used in the sidebar
var addDisplay = document.getElementById('address');

map.on('click', 'mci-lots', function(e) {
  // Set variables equal to the current feature's address, MCI item, claim cost, filing date

  var address = e.features[0].properties.street_address;

  if (e.features.length > 0) {
    var MCIElements = e.features.map((feature, idx) => {
      var {
        properties
      } = feature;
      return `<div>
        <h3 class="mciItemHeader" style="${idx === 0 ? 'padding-top:0' : ''}">
          ${properties.mci_item.toLowerCase() === 'n/a' ? 'Item Unknown' : properties.mci_item}
        </h3>
        <div>
          <strong>Claim Cost:</strong>&nbsp;
          <span id="mciamount">${properties.claim_cost.toLowerCase() === 'n/a' ? 'Amount Unknown' :numberWithCommas(properties.claim_cost)}</span>
        </div>
        <div>
          <strong>Amount Granted:</strong>&nbsp;
          <span id="allowcost">${properties.allow_cost.toLowerCase() === 'n/a' ? 'Amount Unknown' :numberWithCommas(properties.allow_cost)}</span>
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
    map.setLayoutProperty('highlight-outline', 'visibility', 'visible');
    map.setLayoutProperty('highlight-fill', 'visibility', 'visible');
    map.getSource('highlight-feature').setData(e.features[0].geometry);
    infoContainer.innerHTML = MCIElements.join('');

    //zooming map to building that's been clicked
    var coords = flatten(e.features[0].geometry.coordinates)
    var turfFeatures = turf.points(coords);
    var newCenter = turf.center(turfFeatures);
    map.flyTo({
      center: newCenter.geometry.coordinates,
      zoom: 14,
      speed: 1
    })
  }
});

//activate the filter nta settings
const ntaoptions =
{"BX": [
  {value:"reset",desc:"Select a Neighborhood in the Bronx"},
  {value:"BX31",	desc: "Allerton-Pelham Gardens"},
  {value:"BX05",	desc: "Bedford Park-Fordham North"},
  {value:"BX06",	desc: "Belmont"},
  {value:"BX07",	desc: "Bronxdale"},
  {value:"BX01",	desc: "Claremont-Bathgate"},
  {value:"BX13",	desc: "Co-op City"},
  {value:"BX75",	desc: "Crotona Park East"},
  {value:"BX14",	desc: "East Concourse-Concourse Village"},
  {value:"BX17",	desc: "East Tremont"},
  {value:"BX03",	desc: "Eastchester-Edenwald-Baychester"},
  {value:"BX40",	desc: "Fordham South"},
  {value:"BX26",	desc: "Highbridge"},
  {value:"BX27",	desc: "Hunts Point"},
  {value:"BX30",	desc: "Kingsbridge Heights"},
  {value:"BX33",	desc: "Longwood"},
  {value:"BX34",	desc: "Melrose South-Mott Haven North"},
  {value:"BX35",	desc: "Morrisania-Melrose"},
  {value:"BX39",	desc: "Mott Haven-Port Morris"},
  {value:"BX41",	desc: "Mount Hope"},
  {value:"BX22",	desc: "North Riverdale-Fieldston-Riverdale"},
  {value:"BX43",	desc: "Norwood"},
  {value:"BX46",	desc: "Parkchester"},
  {value:"BX10",	desc: "Pelham Bay-Country Club-City Island"},
  {value:"BX49",	desc: "Pelham Parkway"},
  {value:"BX98",	desc: "Rikers Island"},
  {value:"BX52",	desc: "Schuylerville-Throgs Neck-Edgewater Park"},
  {value:"BX55",	desc: "Soundview-Bruckner"},
  {value:"BX09",	desc: "Soundview-Castle Hill-Clason Point-Harding Park"},
  {value:"BX29",	desc: "Spuyten Duyvil-Kingsbridge"},
  {value:"BX36",	desc: "University Heights-Morris Heights"},
  {value:"BX28",	desc: "Van Cortlandt Village"},
  {value:"BX37",	desc: "Van Nest-Morris Park-Westchester Square"},
  {value:"BX63",	desc: "West Concourse"},
  {value:"BX08",	desc: "West Farms-Bronx River"},
  {value:"BX59",	desc: "Westchester-Unionport"},
  {value:"BX44",	desc: "Williamsbridge-Olinville"},
  {value:"BX62",	desc: "Woodlawn-Wakefield"}],

"BK": [
  {value:"reset",desc:"Select a Neighborhood in Brooklyn"},
  {value:"BK27", desc:"Bath Beach"},
  {value:"BK31", desc:"Bay Ridge"},
  {value:"BK75", desc:"Bedford"},
  {value:"BK29", desc:"Bensonhurst East"},
  {value:"BK28", desc:"Bensonhurst West"},
  {value:"BK88", desc:"Borough Park"},
  {value:"BK19", desc:"Brighton Beach"},
  {value:"BK09", desc:"Brooklyn Heights-Cobble Hill"},
  {value:"BK81", desc:"Brownsville"},
  {value:"BK77", desc:"Bushwick North"},
  {value:"BK78", desc:"Bushwick South"},
  {value:"BK50", desc:"Canarsie"},
  {value:"BK33", desc:"Carroll Gardens-Columbia Street-Red Hook"},
  {value:"BK69", desc:"Clinton Hill"},
  {value:"BK61", desc:"Crown Heights North"},
  {value:"BK63", desc:"Crown Heights South"},
  {value:"BK83", desc:"Cypress Hills-City Line"},
  {value:"BK38", desc:"DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill"},
  {value:"BK30", desc:"Dyker Heights"},
  {value:"BK91", desc:"East Flatbush-Farragut"},
  {value:"BK82", desc:"East New York"},
  {value:"BK85", desc:"East New York (Pennsylvania Ave)"},
  {value:"BK90", desc:"East Williamsburg"},
  {value:"BK95", desc:"Erasmus"},
  {value:"BK42", desc:"Flatbush"},
  {value:"BK58", desc:"Flatlands"},
  {value:"BK68", desc:"Fort Greene"},
  {value:"BK45", desc:"Georgetown-Marine Park-Bergen Beach-Mill Basin"},
  {value:"BK26", desc:"Gravesend"},
  {value:"BK76", desc:"Greenpoint"},
  {value:"BK25", desc:"Homecrest"},
  {value:"BK41", desc:"Kensington-Ocean Parkway"},
  {value:"BK44", desc:"Madison"},
  {value:"BK43", desc:"Midwood"},
  {value:"BK73", desc:"North Side-South Side"},
  {value:"BK79", desc:"Ocean Hill"},
  {value:"BK46", desc:"Ocean Parkway South"},
  {value:"BK37", desc:"Park Slope-Gowanus"},
  {value:"BK64", desc:"Prospect Heights"},
  {value:"BK60", desc:"Prospect Lefferts Gardens-Wingate"},
  {value:"BK96", desc:"Rugby-Remsen Village"},
  {value:"BK21", desc:"Seagate-Coney Island"},
  {value:"BK17", desc:"Sheepshead Bay-Gerritsen Beach-Manhattan Beach"},
  {value:"BK93", desc:"Starrett City"},
  {value:"BK35", desc:"Stuyvesant Heights"},
  {value:"BK34", desc:"Sunset Park East"},
  {value:"BK32", desc:"Sunset Park West"},
  {value:"BK23", desc:"West Brighton"},
  {value:"BK72", desc:"Williamsburg"},
  {value:"BK40", desc:"Windsor Terrace"}],

"MN":[
  {value:"reset",desc:"Select a Neighborhood in Manhattan"},
  {value:"MN25", desc: "Battery Park City"},
  {value:"MN03", desc: "Central Harlem North-Polo Grounds"},
  {value:"MN11", desc: "Central Harlem South"},
  {value:"MN27", desc: "Chinatown"},
  {value:"MN15", desc: "Clinton"},
  {value:"MN34", desc: "East Harlem North"},
  {value:"MN33", desc: "East Harlem South"},
  {value:"MN22", desc: "East Village"},
  {value:"MN21", desc: "Gramercy"},
  {value:"MN04", desc: "Hamilton Heights"},
  {value:"MN13", desc: "Hudson Yards/Chelsea/Flatiron"},
  {value:"MN31", desc: "Lenox Hill/Roosevelt Island"},
  {value:"MN14", desc: "Lincoln Square"},
  {value:"MN28", desc: "Lower East Side"},
  {value:"MN06", desc: "Manhattanville"},
  {value:"MN01", desc: "Marble Hill-Inwood"},
  {value:"MN17", desc: "Midtown-Midtown South"},
  {value:"MN09", desc: "Morningside Heights"},
  {value:"MN20", desc: "Murray Hill/Kips Bay"},
  {value:"MN24", desc: "SoHo/TriBeCa/Little Italy"},
  {value:"MN50", desc: "Stuy Town/Peter Cooper Village"},
  {value:"MN19", desc: "Turtle Bay-East Midtown"},
  {value:"MN40", desc: "Upper East Side/Carnegie Hill"},
  {value:"MN12", desc: "Upper West Side"},
  {value:"MN35", desc: "Washington Heights North"},
  {value:"MN36", desc: "Washington Heights South"},
  {value:"MN23", desc: "West Village"},
  {value:"MN32", desc: "Yorkville"}],

"QN": [
  {value:"reset",desc:"Select a Neighborhood in Queens"},
  {value:"QN70", desc:"Astoria"},
  {value:"QN48", desc:"Auburndale"},
  {value:"QN76", desc:"Baisley Park"},
  {value:"QN46", desc:"Bayside-Bayside Hills"},
  {value:"QN43", desc:"Bellerose"},
  {value:"QN10", desc:"Breezy Point-Belle Harbor-Rockaway Park-Broad Channel"},
  {value:"QN35", desc:"Briarwood-Jamaica Hills"},
  {value:"QN33", desc:"Cambria Heights"},
  {value:"QN23", desc:"College Point"},
  {value:"QN25", desc:"Corona"},
  {value:"QN45", desc:"Douglas Manor-Douglaston-Little Neck"},
  {value:"QN27", desc:"East Elmhurst"},
  {value:"QN52", desc:"East Flushing"},
  {value:"QN29", desc:"Elmhurst"},
  {value:"QN50", desc:"Elmhurst-Maspeth"},
  {value:"QN15", desc:"Far Rockaway-Bayswater"},
  {value:"QN22", desc:"Flushing"},
  {value:"QN17", desc:"Forest Hills"},
  {value:"QN41", desc:"Fresh Meadows-Utopia"},
  {value:"QN47", desc:"Ft. Totten-Bay Terrace-Clearview"},
  {value:"QN44", desc:"Glen Oaks-Floral Park-New Hyde Park"},
  {value:"QN19", desc:"Glendale"},
  {value:"QN12", desc:"Hammels-Arverne-Edgemere"},
  {value:"QN07", desc:"Hollis"},
  {value:"QN31", desc:"Hunters Point-Sunnyside-West Maspeth"},
  {value:"QN28", desc:"Jackson Heights"},
  {value:"QN61", desc:"Jamaica"},
  {value:"QN06", desc:"Jamaica Estates-Holliswood"},
  {value:"QN60", desc:"Kew Gardens"},
  {value:"QN37", desc:"Kew Gardens Hills"},
  {value:"QN66", desc:"Laurelton"},
  {value:"QN57", desc:"Lindenwood-Howard Beach"},
  {value:"QN30", desc:"Maspeth"},
  {value:"QN21", desc:"Middle Village"},
  {value:"QN51", desc:"Murray Hill"},
  {value:"QN26", desc:"North Corona"},
  {value:"QN42", desc:"Oakland Gardens"},
  {value:"QN71", desc:"Old Astoria"},
  {value:"QN56", desc:"Ozone Park"},
  {value:"QN38", desc:"Pomonok-Flushing Heights-Hillcrest"},
  {value:"QN34", desc:"Queens Village"},
  {value:"QN62", desc:"Queensboro Hill"},
  {value:"QN68", desc:"Queensbridge-Ravenswood-Long Island City"},
  {value:"QN18", desc:"Rego Park"},
  {value:"QN54", desc:"Richmond Hill"},
  {value:"QN20", desc:"Ridgewood"},
  {value:"QN05", desc:"Rosedale"},
  {value:"QN01", desc:"South Jamaica"},
  {value:"QN55", desc:"South Ozone Park"},
  {value:"QN02", desc:"Springfield Gardens North"},
  {value:"QN03", desc:"Springfield Gardens South-Brookville"},
  {value:"QN08", desc:"St. Albans"},
  {value:"QN72", desc:"Steinway"},
  {value:"QN49", desc:"Whitestone"},
  {value:"QN53", desc:"Woodhaven"},
  {value:"QN63", desc:"Woodside"}],

"SI": [
  {value:"reset",desc:"Select a Neighborhood in Staten Island"},
  {value:"SI01",	desc:"Annadale-Huguenot-Prince's Bay-Eltingville"},
  {value:"SI48",	desc:"Arden Heights"},
  {value:"SI11",	desc:"Charleston-Richmond Valley-Tottenville"},
  {value:"SI14",	desc:"Grasmere-Arrochar-Ft. Wadsworth"},
  {value:"SI54",	desc:"Great Kills"},
  {value:"SI08",	desc:"Grymes Hill-Clifton-Fox Hills"},
  {value:"SI12",	desc:"Mariner's Harbor-Arlington-Port Ivory-Graniteville"},
  {value:"SI35",	desc:"New Brighton-Silver Lake"},
  {value:"SI45",	desc:"New Dorp-Midland Beach"},
  {value:"SI05",	desc:"New Springville-Bloomfield-Travis"},
  {value:"SI25",	desc:"Oakwood-Oakwood Beach"},
  {value:"SI36",	desc:"Old Town-Dongan Hills-South Beach"},
  {value:"SI99",	desc:"park-cemetery-etc-Staten Island"},
  {value:"SI28",	desc:"Port Richmond"},
  {value:"SI32",	desc:"Rossville-Woodrow"},
  {value:"SI37",	desc:"Stapleton-Rosebank"},
  {value:"SI24",	desc:"Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill"},
  {value:"SI22",	desc:"West New Brighton-New Brighton-St. George"},
  {value:"SI07",	desc:"Westerleigh"}]
}

function filter_set() {
  var select = document.getElementById("boro_selector");
  var boro = select.options[select.selectedIndex].value;
  const ntabyboro = document.getElementById('nta_code');
  if (boro == 'reset') {
    ntabyboro.innerHTML = '';
  } else {
  ntabyboro.innerHTML = ntaoptions[boro].reduce((acc, elem) => `${acc}<option value="${elem.value}">${elem.desc}</option>`, "");
  }
}


//filter map by NTA
function set_nta() {
  var select = document.getElementById("nta_code");
  var nta = select.options[select.selectedIndex].value;

  if (nta === 'reset') {

  } else {
    //filtering layers based on selected NTA
    map.setFilter('mci-lots',
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
  map.setFilter('mci-lots')

  map.setFilter('mci-outlines')

  map.setFilter('lots-outlines')

  //removes content in info container
  addDisplay.textContent = "";
  infoContainer.innerHTML = "";

  //removes highlight of selected lot
  map.setLayoutProperty('highlight-outline', 'visibility', 'none');
  map.setLayoutProperty('highlight-fill', 'visibility', 'none');

  //removes aggregate window

  document.getElementById("NTA_info").style.visibility = "hidden";

  //shifts map back to starting center and zoom level
  map.easeTo({
    center: [-73.92013728138733, 40.71401732482218,], // starting position [lng, lat]
    zoom: 10.5 // starting zoom
  })

  //reset dropdown menu
  document.getElementById("boro_selector").selectedIndex = 0;
  document.getElementById("nta_code").innerHTML = "";

  //removes Geocoder's marker
  geocoder.mapMarker.remove();
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
map.on('mouseenter', 'mci-lots', function() {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'mci-lots', function() {
  map.getCanvas().style.cursor = '';
});
