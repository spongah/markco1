var map;
var infoWindow;
var bounds;
var myPosition;
var myMarker;
var myWatcher;
var myIcon = "ericsmall.png";
var mainloopcount = 0;
var allMarkers = [];

function mainLoop() {
  setTimeout(function () {

        document.getElementById("status").innerHTML = String(mainloopcount);

        mainloopcount += 1;
        mainLoop();
    }, 5000);
}



function initMap() {
	var updates = 0;
 	bounds = new google.maps.LatLngBounds();	// CREATE BOUNDS OBJECT, SET TO GLOBAL VARIABLE
 	getMyLocation(function () {
 		var options = {
									  enableHighAccuracy: true,
									  timeout: Infinity,
									  maximumAge: 1000
									}

 		createMap();														// CREATES MAP AFTER getMyLocation SETS myPosition

    //console.log("updating position 1");
    updatePosition()                        // SEND NEW POSITION TO DATABASE

 		myMarker = placeMarker(myPosition, "", "YOU", "http://www.fakefakefake.gov/", gon.user.icon); // SET MY MARKER
 	  if (gon.markerArray) { loadMarkers(gon.markerArray); }						// LOAD OTHER MARKERS (NOT MINE)

    map.fitBounds(bounds);									// ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
    map.setCenter(myPosition);							// CENTER MAP ON myPosition

    mainLoop();

    // console.log("starting position: " + myPosition.lat + "," + myPosition.lng);
    // document.getElementById('status').innerHTML = myPosition.lat + "," + myPosition.lng;
    myWatcher = navigator.geolocation.watchPosition(function(position) {		// SET WATCHER FOR LOCATION CHANGE
		  updates += 1;
		  // console.log(position);
		  myPosition.lat = position.coords.latitude;		// SET myPosition
		  myPosition.lng = position.coords.longitude;		// SET myPosition
		  // document.getElementById('status2').innerHTML = myPosition.lat + "," + myPosition.lng;
		  // document.getElementById('status3').innerHTML = "updates: " + updates;
		  myMarker.setPosition(myPosition);							// SET myMarker POSITION BASED ON UPDATED myPosition
    	map.setCenter(myPosition);										// RE CENTER MAP
      //console.log("updating position 2");
      updatePosition();                             // SEND NEW POSITION TO DATABASE
		}, function(err){ console.log(err) }, options);	// LOGS ERRORS TO CONSOLE, INSERTS OPTIONS HASH
 	});
}

function updatePosition() {
  urlValue = "updatepos";
  $.ajax({          
    data: myPosition,
    url: urlValue,
    type: "PATCH",
    dataType: "json"
  });
}

function createMap() {
	map = new google.maps.Map(document.getElementById('map'), {			// CREATE MAP CENTERED ON MYPOSITION
    center: myPosition,
    zoom: 13,
    mapTypeId: 'hybrid'
  });    
  // console.log("map: " + map)
}

function getMyLocation(callback) {
	if (navigator.geolocation) {																		// GET MYLOCATION FROM HTML5
    navigator.geolocation.getCurrentPosition(function(position) {
      myPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      // console.log("my position: " + myPosition);
      callback && callback();
    });
  } else {
    document.getElementById('map').innerHTML = "Browser doesn't support Geolocation";
  }
}

function loadMarkers(markerArray) {
  allMarkers = [];
	for(x=0;x<markerArray.length;x+=1) {
		m = markerArray[x];
		tempPosition = { lat : m.lat, lng : m.lng };
		allMarkers[x] = placeMarker(tempPosition, String(x+2), m.name, "", m.icon);
	}
}

function placeMarker(pos, label, title, url, image) {							// PLACE A MARKER AND EXTEND BOUNDS
	marker = new google.maps.Marker({																// DOES NOT RE CENTER OR ZOOM MAP
    position: new google.maps.LatLng(pos),
    label: label,
    title: title,
    url: url,
    animation: google.maps.Animation.DROP,
    icon: image,
    map: map
  });
  bounds.extend(marker.position);
  google.maps.event.addListener(marker, 'click', function() {
      window.location.href = url;
  });
  return marker;																									// RETURN MARKER SO WE CAN KEEP TRACK
}
