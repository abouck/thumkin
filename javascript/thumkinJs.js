//initialize Firebase
var taxiData=[];
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
var map, heatmapUp, heatmapDown, heatSlidePosUp;
var thumbUpData = [],
  thumbDownData = [];
var coords = "";
var thumbs = [];

function initialize() {
  auth.login('anonymous');

  // Are we showing the map page?
  if(document.getElementById('map-canvas') != null)
    thumkinData.on('value', haveThumkinData);
}
// Go ahead and load the above when the window is ready
google.maps.event.addDomListener(window, 'load', initialize);

function haveThumkinData(snapshot) {
  taxiData = snapshot.val().thumbs;
//   taxiData = snapshot.val().testData["-J6IyUU_0mwX8TfSCPQQ"].testData;
   var hourOffset = 0;
   var num = 0;
   var dt = new Date(2013, 10, 19, 11, 0, 0);  // 11 AM yesterday
  for(var i in taxiData)
  {
    ++num;
    // switch(num)
    // {
    //   case 20: // Noon
    //   case 40: // 1
    //   case 55: // 2
    //   case 70: // 3
    //   case 85: // 4
    //   case 95: // 5
    //   case 105: // 6
    //   case 115: // 7
    //   case 130: // 8
    //   case 142: // 9
    //   case 160: // 10
    //   case 190: // 11
    //   case 230: // midnight
    //   case 280: // 1am
    //   case 320: // 2
    //   case 345: // 3
    //   case 354: // 4
    //   case 355: // 5
    //   case 356: // 6
    //   case 357: // 7
    //   case 358: // 8
    //   case 360: // 9
    //   case 365: // 10
    //     hourOffset++;
    //     break;
    // }
    // thumbs
    //   .push({lb:taxiData[i].lb, mb:taxiData[i].mb, isUp:(Math.random() > 0.4),
    //     thumbTime:(new Date(dt.getTime()+(hourOffset*3600000))).toISOString()});

    var thumb = {pt:new google.maps.LatLng(taxiData[i].lb, taxiData[i].mb),
      isUp:taxiData[i].isUp,
      thumbTime:taxiData[i].thumbTime};
    if(taxiData[i].isUp)
      thumbUpData.push(thumb);
    else
      thumbDownData.push(thumb);
  }
  console.log(num);

  // OK, we've loaded all the existing data, so no more need to notify
  thumkinData.off('value', haveThumkinData);

  // // Final step in loading up the sample thumbs
  // for(thm in thumbs)
  //   thumkinData.child("thumbs").push(thumbs[thm]);


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

  pointUpArray = new google.maps.MVCArray([]);
  pointDownArray = new google.maps.MVCArray([]);

  // Set an initial set as the first 75
  var num = 0;
  for(var i in thumbUpData)
  {
    if(num++ == 50)
      break;
    pointUpArray.push(thumbUpData[i].pt);
  }
 var num = 0;
  for(var i in thumbDownData)
  {
    if(num++ == 50)
      break;
    pointDownArray.push(thumbDownData[i].pt);
  }
  heatSlidePosUp = 0;
  heatSlidePosDown = 0;


  heatmapUp = new google.maps.visualization.HeatmapLayer({
    data: pointUpArray
  });

  heatmapDown = new google.maps.visualization.HeatmapLayer({
    data: pointDownArray
  });

  heatmapUp.setOptions({
    gradient: [
    'rgba(0,17,0,0)',
    'rgba(0,84,0,1)',
    'rgba(0,120,0,1)',
    'rgba(0,160,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,0,1)'
    ],
    radius: 20
  });

  heatmapDown.setOptions({
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

  heatmapUp.setMap(map);
  heatmapDown.setMap(map);

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
    pointUpArray.removeAt(0);
    pointUpArray.removeAt(0);
    pointUpArray.removeAt(0);
    pointUpArray.removeAt(0);
    pointUpArray.removeAt(0);
    pointUpArray.push(thumbUpData[(heatSlidePosUp++ + pointUpArray.length) %
     thumbUpData.length].pt);
    pointUpArray.push(thumbUpData[(heatSlidePosUp++ + pointUpArray.length) %
     thumbUpData.length].pt);
    pointUpArray.push(thumbUpData[(heatSlidePosUp++ + pointUpArray.length) %
     thumbUpData.length].pt);
    pointUpArray.push(thumbUpData[(heatSlidePosUp++ + pointUpArray.length) %
     thumbUpData.length].pt);
    pointUpArray.push(thumbUpData[(heatSlidePosUp++ + pointUpArray.length) %
     thumbUpData.length].pt);
    if (heatSlidePosUp >= taxiData.length)
      heatSlidePosUp = 0;

    pointDownArray.removeAt(0);
    pointDownArray.removeAt(0);
    pointDownArray.removeAt(0);
    pointDownArray.removeAt(0);
    pointDownArray.removeAt(0);
    pointDownArray.push(thumbDownData[(heatSlidePosDown++ + pointDownArray.length) %
     thumbDownData.length].pt);
    pointDownArray.push(thumbDownData[(heatSlidePosDown++ + pointDownArray.length) %
     thumbDownData.length].pt);
    pointDownArray.push(thumbDownData[(heatSlidePosDown++ + pointDownArray.length) %
     thumbDownData.length].pt);
    pointDownArray.push(thumbDownData[(heatSlidePosDown++ + pointDownArray.length) %
     thumbDownData.length].pt);
    pointDownArray.push(thumbDownData[(heatSlidePosDown++ + pointDownArray.length) %
     thumbDownData.length].pt);
    if (heatSlidePosDown >= taxiData.length)
      heatSlidePosDown = 0;

    setTimeout(heatSlide, 120);
}

var isDisableThumb = false;
var isUpValue;
function thumb(isUp)
{
  isUpValue = isUp;
  if(isDisableThumb)
    return;
  navigator.geolocation.getCurrentPosition(thumbLocSuccess, thumbLocError);
  isDisableThumb = true;
}
function thumbLocSuccess(location) {
  thumkinData.thumbs.push({lb:location.coords.latitude, mb:location.coords.longitude,
   isUp:isUpValue, thumbTime:new Date().toISOString()});
  isDisableThumb = false;
}
function thumbLocError(error) {
  thumkinData.thumbs.push({lb:34.0, mb:-118.0, isUp:isUpValue,
   thumbTime:new Date().toISOString()});
  isDisableThumb = false;
}
