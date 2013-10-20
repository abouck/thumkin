//initialize Firebase
var thumkinData = new Firebase('https://thumkin.firebaseio.com/');


// OK now let's do a lil something
var map, pointArray, heatmap, heatSlidePos;

var coords = "";


function initialize() {
  // Try to find out where the hell we are
  navigator.geolocation.getCurrentPosition(locSuccess, locError);
}
// Go ahead and load this when the window is ready
google.maps.event.addDomListener(window, 'load', initialize);

// function toggleHeatmap() {
//   heatmap.setMap(heatmap.getMap() ? null : map);
// }


function changeRadius() {
  heatmap.setOptions({radius: heatmap.get('radius') ? null : 20});
}

function changeOpacity() {
  heatmap.setOptions({opacity: heatmap.get('opacity') ? null : 0.2});
}

function locSuccess(location) {
    doMapBS(location.coords.latitude, location.coords.longitude);
}
function locError(error) {
    alert('Attempt to get location failed: ' + error.message);
    // Santa freakin' Monica
    doMapBS(34.0219, -118.4814);
}



function doMapBS(lat,lon){
    var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(lat, lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
    {
      featureType: "all",
      stylers: [{invert_lightness: true}]
    },
    {
      featureType: "landscape",
      stylers: [{color: '#17031c'}]
    },
    {
      featureType: "poi",
      stylers: [{visibility: 'off'}]
    },
    {
      featureType: "road.highway",
      stylers: [{color: '#c0e0ff'}]
    },
    {
      featureType: "road.highway",
      elementType: "labels",
      stylers: [{visibility: 'off'}]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{color: '#545454'}]
    },
    {
      featureType: "landscape.manmade",
      elementType: "geometry.stroke",
      stylers: [{color: '#545454'}]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [{color: '#000000'}]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{color: '#ffffff'}]
    },
    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [{color: '#ffffff'}]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{color: '#032b30'}]
    }
  ]
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  pointArray = new google.maps.MVCArray([]);

  // Set an initial set as the first 50
  for(var i = 0;i<75;++i)
    pointArray.push(taxiData[i]);
  heatSlidePos = 0;

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: pointArray
  });

  heatmap.setOptions({
    gradient: [
    'rgba(17,0,0,0)',
    'rgba(84,0,0,1)',
    'rgba(120,0,0,1)',
    'rgba(160,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)',
    'rgba(255,0,0,1)'
    ],
    radius: 20
  });

  heatmap.setMap(map);

  // Make it clickable
  google.maps.event.addListener(map, 'click', function(event) {
  //    marker = new google.maps.Marker({position: event.latLng, map: map});

  // for(var i in taxiData)
  // coords += "new google.maps.LatLng("+(taxiData[i].lb - 0.05)+", " + (taxiData[i].mb - 0.05) + "),<br />";
  //   document.getElementById("messages").innerHTML = coords;

    coords += "<br />" + event.latLng.lb + "," + event.latLng.mb + ","+new Date();
    document.getElementById("messages").innerHTML = coords;
  });

    // Seed the change
    heatSlide();
}


function heatSlide(){
    pointArray.removeAt(0);
    pointArray.removeAt(0);
    pointArray.removeAt(0);
    pointArray.removeAt(0);
    pointArray.removeAt(0);
    pointArray.push(taxiData[(heatSlidePos++ + pointArray.length) % taxiData.length]);
    pointArray.push(taxiData[(heatSlidePos++ + pointArray.length) % taxiData.length]);
    pointArray.push(taxiData[(heatSlidePos++ + pointArray.length) % taxiData.length]);
    pointArray.push(taxiData[(heatSlidePos++ + pointArray.length) % taxiData.length]);
    pointArray.push(taxiData[(heatSlidePos++ + pointArray.length) % taxiData.length]);
    console.log(heatSlidePos + " " + pointArray.length);
    if (heatSlidePos >= taxiData.length)
      heatSlidePos = 0;
    setTimeout(heatSlide, 120);
}
