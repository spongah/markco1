var map;
var infoWindow;
var bounds;
var myPosition;
var myMarker;
var myWatcher;
var mainloopcount = 0;
var allMarkers = [];
var modal;
var closeModal;

function mainLoop() {
  setTimeout(function () {
    gon.watch("markerArray", function(result){
      updateMarkers(result);
    });
    gon.watch("inviteArray", function(result){
      if (result[0] != undefined) {
        console.log(result);
        displayInvite(result[0]);
      }
    });

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
									  maximumAge: 5000
									}

 		createMap();														// CREATES MAP AFTER getMyLocation SETS myPosition

    updatePosition()                        // SEND NEW POSITION TO DATABASE

 		myMarker = placeMarker(myPosition, "", gon.user.name, "", gon.user.icon); // SET MY MARKER
 	  if (gon.markerArray) { loadMarkers(gon.markerArray); }						// LOAD OTHER MARKERS (NOT MINE)

    map.fitBounds(bounds);									// ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
    map.setCenter(myPosition);							// CENTER MAP ON myPosition

    gon.watch("roomName", function(result) {
      document.getElementById("roomid").innerHTML = result;
    });

    mainLoop();

    modal = document.getElementById('myModal');
    userInviting = document.getElementById('userInviting');
    closeModal = document.getElementsByClassName("close")[0];
    acceptInvite = document.getElementById('acceptInvite');
    declineInvite = document.getElementById('declineInvite');

    myWatcher = navigator.geolocation.watchPosition(function(position) {		// SET WATCHER FOR LOCATION CHANGE
		  updates += 1;
		  myPosition.lat = position.coords.latitude;		// SET myPosition
		  myPosition.lng = position.coords.longitude;		// SET myPosition
		  myMarker.setPosition(myPosition);							// SET myMarker POSITION BASED ON UPDATED myPosition
      updatePosition();                             // SEND NEW POSITION TO DATABASE
		}, function(err){ console.log(err) }, options);	// LOGS ERRORS TO CONSOLE, INSERTS OPTIONS HASH
 	});
}

function displayInvite(user) {
  userInviting.innerHTML = user.name;
  console.log("updating to room # " + user.room);
  modal.style.display = "block";
  invitingUser = user;

  acceptInvite.onclick = function() {
    newRoom = invitingUser.room;
    updateGeneric(user = { room: newRoom });
    document.getElementById("roomid").innerHTML = invitingUser.name + "'s Room";

    console.log("ACCEPTED INVITE!");
    modal.style.display = "none";
  }

  declineInvite.onclick = function() {
    console.log("DECLINED INVITE!");
    modal.style.display = "none";
  }

  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
}

function updateMarkers(markerArray) {
  bounds = new google.maps.LatLngBounds();
  bounds.extend(myPosition);
  for(x=0;x<markerArray.length;x+=1) {
    bounds.extend(markerArray[x]);
  }
  if ((markerArray != []) && (typeof(markerArray) != 'undefined')) {

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
            allMarkers[y].setPosition(tempPosition);        // MOVE MARKERS, LETS MAKE A FUNCTION TO ANIMATE THIS?
            document.getElementById('status').innerHTML = "Updated " + m.name + "'s position!";
            // map.fitBounds(bounds);                     //  I THINK NO FITBOUNDS AFTER UPDATES (HAPPENS A LOT)
          }
          markerFound = true;
        }
      }
      if (!markerFound) {
        allMarkers[allMarkers.length] = placeMarker(tempPosition, "", m.name, "", m.icon, m.userid)
        map.fitBounds(bounds);                  // I THINK FIT BOUNDS AFTER ADDING A NEW PERSON!
        document.getElementById('status2').innerHTML = m.name + " just joined the map!";
        //map.setCenter(myPosition);              // CENTER MAP ON myPosition
      }
    }

    // DELETE ANY MARKERS FOUND IN CURRENT MARKER THAT ARE NOT IN NEW MARKER ARRAY
    newMarkerLength = markerArray.length;
    currentMarkerLength = allMarkers.length;
    for(x=0;x<currentMarkerLength;x+=1) {
      markerExists = false;
      for(y=0;y<newMarkerLength;y+=1) {
        if (markerArray[y].userid == allMarkers[x].userid) {
          markerExists = true;
        }
      }
      if (!markerExists) {
        document.getElementById('status2').innerHTML = allMarkers[x].title + " just left the map!";
        allMarkers[x].setMap(null);
        allMarkers.splice(x,1);
        currentMarkerLength -= 1;

        // map.fitBounds(bounds);                   // I THINK DONT FIT BOUNDS AFTER SOMEONE DISAPPEARS
      }
    }
    //map.setCenter(myPosition);              // CENTER MAP ON myPosition
  }
}

function updateGeneric(data) {
  urlValue = "updatepos";
  $.ajax({          
    data: data,
    url: urlValue,
    type: "PATCH",
    dataType: "json"
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
}

function getMyLocation(callback) {
	if (navigator.geolocation) {																		// GET MYLOCATION FROM HTML5
    navigator.geolocation.getCurrentPosition(function(position) {
      myPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
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
 // google.maps.event.addListener(marker, 'click', function() {
 //     window.location.href = url;
 // });
  return marker;																									// RETURN MARKER SO WE CAN KEEP TRACK
}
