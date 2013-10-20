//initialize Firebase
var taxiData;
var thumkinData = new Firebase('https://thumkin2.firebaseio.com');

var auth = new FirebaseSimpleLogin(thumkinData, function(error, user) {
  if (error) {
    // an error occurred while attempting login
    console.log(error);
  } else if (user) {
    // user authenticated with Firebase
    console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
  } else {
    // user is logged out
  }
});

// OK now let's do a lil something
var map, pointArray, heatmap, heatSlidePos;

var coords = "";


function initialize() {
  auth.login('anonymous');

  thumkinData.on('value', haveThumkinData);
}
// Go ahead and load the above when the window is ready
google.maps.event.addDomListener(window, 'load', initialize);

function haveThumkinData(snapshot) {
  taxiData = snapshot.val().testData["-J6IyUU_0mwX8TfSCPQQ"].testData;
  for(var i in taxiData)
    taxiData[i] = new google.maps.LatLng(taxiData[i].lb, taxiData[i].mb);

  // OK, we've loaded all the existing data, so no more need to notify
  thumkinData.off('value', haveThumkinData);
  // But we do want to know about new rows being added by others
  thumkinData.on('child_added', addedThumkinData);

  // Next try to find out where the hell we are
  navigator.geolocation.getCurrentPosition(locSuccess, locError);
}

function addedThumkinData(newData){
  console.log(newData);
}

// function toggleHeatmap() {
//   heatmap.setMap(heatmap.getMap() ? null : map);
// }
// function changeRadius() {
//   heatmap.setOptions({radius: heatmap.get('radius') ? null : 20});
// }
// function changeOpacity() {
//   heatmap.setOptions({opacity: heatmap.get('opacity') ? null : 0.2});
// }

function locSuccess(location) {
    doMapBS(location.coords.latitude, location.coords.longitude);
}
function locError(error) {
    alert('Attempt to get location failed: ' + error.message);
    // Santa freakin' Monica
    doMapBS(34.0219, -118.4814);
}

// Get the map all set
function doMapBS(lat,lon){

  // newArr = thumkinData.child('testData')
  // newArr.push({testData: taxiData}, function(error){
  //   if (error){
  //     console.log("data not saved." + error);
  //   } else {
  //     console.log("data saved.");
  //   }
  // });

    var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(lat, lon),
      disableDefaultUI: true,
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
          featureType: "transit.station.airport",
          elementType: "geometry.fill",
          stylers: [{color: '#110027'}]
        },
        {
          featureType: "transit.station.airport",
          elementType: "geometry.stroke",
          stylers: [{color: '#444444'}]
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

  pointArray2 = new google.maps.MVCArray([]);

  // Set an initial set as the first 50
  for(var i = 0;i<75;++i)
    pointArray2.push(taxiData2[i]);
    heatSlidePos = 0;

  heatmap2 = new google.maps.visualization.HeatmapLayer({
    data: pointArray2
  });

  heatmap2.setOptions({
    gradient: [
    'rgba(0,0,100,0)',
    'rgba(30,150,0,1)',
    'rgba(50,180,0,1)',
    'rgba(50,200,0,1)',
    'rgba(50,225,0,1)',
    'rgba(50,255,0,1)',
    'rgba(50,255,0,1)'
    // 'rgba(50,50,100,0)',
    // 'rgba(0,0,84,1)',
    // 'rgba(0,0,120,1)',
    // 'rgba(42,87,95,1)',
    // 'rgba(0,0,160,1)',
    // 'rgba(0,0,255,1)',
    // 'rgba(0,0,255,1)',
    // 'rgba(102,174,187,1)',
    // 'rgba(102,174,187,1)'
    ],
    radius: 20
  });

  heatmap2.setMap(map);

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
    if (heatSlidePos >= taxiData.length)
      heatSlidePos = 0;
    setTimeout(heatSlide, 120);
}
