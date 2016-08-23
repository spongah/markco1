var map;
var infoWindow;
var bounds;
var myPosition;
var myMarker;
var myWatcher;
// var myIcon = "ericsmall.png";
var mainloopcount = 0;
var allMarkers = [];

function mainLoop() {
  setTimeout(function () {
        // HERE WE WILL CALL UPDATEMARKERS WHICH WILL TRIGGER THE RAILS METHOD TO UPDATE THE RAILS VARIABLE MARKERARRAY
        // THEN IT WILL SIMPLY LOOP THROUGH THE ALLMARKERS ARRAY AND UPDATE POSITION FOR EACH ONE BASED ON THE GON.MARKERARRAY
        gon.watch("markerArray", function(result){
          updateMarkers(result);
        });

        // document.getElementById("status").innerHTML = String(mainloopcount);   // count updates

        mainloopcount += 1;
        mainLoop();
    }, 2000);
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

 		myMarker = placeMarker(myPosition, "", gon.user.name, "", gon.user.icon); // SET MY MARKER
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

function updateMarkers(markerArray) {
  // console.log("running updateMarkers");
//  $.ajax({          
//    data: "",
//    url: "updatemarkers",
//    type: "PATCH",
//    dataType: "json"
//  });
  // console.log(markerArray);
  var newMarkerLength = markerArray.length;
  var currentMarkerLength = allMarkers.length;
  for(x=0;x<newMarkerLength;x+=1) {
    m = markerArray[x];
    markerFound = false;
    tempPosition = {
        lat: m.lat,
        lng: m.lng
    };
    for(y=0;y<currentMarkerLength;y+=1) {
      if (m.userid == allMarkers[y].userid) {
        if ((Number(allMarkers[y].position.lat()).toPrecision(10) != Number(m.lat).toPrecision(10)) || (Number(allMarkers[y].position.lng()).toPrecision(10) != Number(m.lng).toPrecision(10))) {
          //console.log("marker updated! user id: " + m.userid);
          //console.log("old lat: " + Number(allMarkers[y].position.lat()).toPrecision(10) + " old lng: " + Number(allMarkers[y].position.lng()).toPrecision(10));
          //console.log("new lat: " + Number(m.lat).toPrecision(10) + " new lng: " + Number(m.lng).toPrecision(10));

          allMarkers[y].setPosition(tempPosition);        // WRITE A FUNCTION TO ANIMATE THIS SO IT'S SMOOTHER
        }
        markerFound = true;
      }
      // console.log("looping2");
    }
    if (!markerFound) {
      allMarkers[allMarkers.length] = placeMarker(tempPosition, "", m.name, "", m.icon, m.userid)
      console.log("placed marker with userid: " + m.userid);
    }
    // console.log("looping1");
  }
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
		allMarkers[x] = placeMarker(tempPosition, "", m.name, "", m.icon, m.userid);
	}
}

function placeMarker(pos, label, title, url, image, userid) {							// PLACE A MARKER AND EXTEND BOUNDS
	marker = new google.maps.Marker({																// DOES NOT RE CENTER OR ZOOM MAP
    position: new google.maps.LatLng(pos),
    label: label,
    title: title,
    url: url,
    animation: google.maps.Animation.DROP,
    icon: image,
    map: map,
    userid: userid
  });
  bounds.extend(marker.position);
  google.maps.event.addListener(marker, 'click', function() {
      window.location.href = url;
  });
  return marker;																									// RETURN MARKER SO WE CAN KEEP TRACK
}
