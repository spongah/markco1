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
    gon.watch("user", function(result){
      if (result.room == result.id) {
        document.getElementById("homebutton").style.display = "none";
        document.getElementById("invitebutton").style.display = "initial";
      } else {
        document.getElementById("homebutton").style.display = "initial";
        document.getElementById("invitebutton").style.display = "none";
      }
      if ((result.room != result.invite) && (result.invite != result.id)) {
        gon.watch("inviter", function(result2){
          displayInvite({room: result2.room, name: result2.name});
        });
      }
    });


    mainloopcount += 1;
    mainLoop();
  }, 5000);
}

function initMap() {
	var updates = 0;
 	bounds = new google.maps.LatLngBounds();	// CREATE BOUNDS OBJECT, SET TO GLOBAL VARIABLE

  gon.watch("user", function(result){
    if (result.room == result.id) {
      document.getElementById("homebutton").style.display = "none";
      document.getElementById("invitebutton").style.display = "initial";
    } else {
      document.getElementById("homebutton").style.display = "initial";
      document.getElementById("invitebutton").style.display = "none";
    }
    if ((result.room != result.invite) && (result.invite != result.id)) {
      gon.watch("inviter", function(result2){
        displayInvite({room: result2.room, name: result2.name});
      });
    }
  });

 	getMyLocation(function () {
 		var options = {
									  enableHighAccuracy: true,
									  timeout: Infinity,
									  maximumAge: 5000
									}

 		createMap();														// CREATES MAP AFTER getMyLocation SETS myPosition

    updatePosition()                        // SEND NEW POSITION TO DATABASE

 		myMarker = placeMarker(myPosition, "", gon.user.name, "", gon.user.icon); // SET MY MARKER
 	  if (gon.markerArray) { 
      loadMarkers(gon.markerArray);    
      map.fitBounds(bounds);                 // ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
      map.setCenter(bounds.getCenter());              // CENTER MAP ON myPosition
    }						// LOAD OTHER MARKERS (NOT MINE)

    gon.watch("roomName", function(result) {
      document.getElementById("roomid").innerHTML = result;
    });

    document.getElementById("invitebutton").onclick = function(){
      displayInvite({room: 1, name: "Eric"});
    }

    document.getElementById("homebutton").onclick = function() {
      goHome();
    }


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

function fade_out_joined() {
  $("#joined").fadeOut(2000, function() { 
    $(this).remove()
  });
}

function fade_out_declined() {
  $("#declined").fadeOut(2000, function() { 
    $(this).remove()
  });
}

function fade_out_leftgroup() {
  $("#leftgroup").fadeOut(2000, function() { 
    $(this).remove()
  });
}

function displayInvite(user) {
  userInviting.innerHTML = user.name;
  modal.style.display = "block";
  invitingUser = user;

  acceptInvite.onclick = function() {
    updateGeneric(user = { invite: gon.user.id });
    newRoom = invitingUser.room;
    updateGeneric(user = { room: newRoom });
    document.getElementById("roomid").innerHTML = invitingUser.name + "'s Group";
    modal.style.display = "none";
    // bounds = new google.maps.LatLngBounds();  // CREATE BOUNDS OBJECT, SET TO GLOBAL VARIABLE
    bounds.extend(myMarker.position);
    if (allMarkers) {
      for (x=0;x<allMarkers.length;x++) {
        bounds.extend(allMarkers[x].position);
      }
    }
    gon.watch("markerArray", function(results) { 
      updateMarkers(results);
      map.fitBounds(bounds);                  // ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
      map.setCenter(bounds.getCenter());
      // map.setCenter(myPosition);              // CENTER MAP ON myPosition
    });

    // document.getElementById("status").innerHTML = "You joined " + invitingUser.name + "'s group!"
    document.getElementById("status").innerHTML = "<p class=\"notice success alert-box\" id=\"joined\">You joined " + invitingUser.name + "'s group!</p>";
    document.getElementById("homebutton").style.display = "initial";
    document.getElementById("invitebutton").style.display = "none";
    setTimeout(fade_out_joined, 5000);      
  }

  declineInvite.onclick = function() {
    updateGeneric(user = { invite: gon.user.id });
    modal.style.display = "none";
    //document.getElementById("status").innerHTML = "You declined " + invitingUser.name + "'s invitation!"
    document.getElementById("status").innerHTML = "<p class=\"alert error alert-box\" id=\"declined\">You declined " + invitingUser.name + "'s invitation!</p>";
    setTimeout(fade_out_declined, 5000);
  }

  window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
  }
}

function goHome() {
  updateGeneric({ room: gon.user.id });
  bounds = new google.maps.LatLngBounds();  // CREATE BOUNDS OBJECT, SET TO GLOBAL VARIABLE
  bounds.extend(myMarker.position);
  gon.watch("markerArray", function(results) { 
    updateMarkers(results); 
    map.fitBounds(bounds);                  // ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
    map.setCenter(myPosition); 
  });
  document.getElementById("roomid").innerHTML = "Your Group";
  document.getElementById("homebutton").style.display = "none";
  document.getElementById("invitebutton").style.display = "initial";
  //document.getElementById("status").innerHTML = "You left the group!"
  document.getElementById("status").innerHTML = "<p class=\"alert error alert-box\" id=\"leftgroup\">You left the group!</p>";
  setTimeout(fade_out_leftgroup, 5000);
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
            // document.getElementById('status').innerHTML = "Updated " + m.name + "'s position!";
            // map.fitBounds(bounds);                     //  I THINK NO FITBOUNDS AFTER UPDATES (HAPPENS A LOT)
          }
          markerFound = true;
        }
      }
      if (!markerFound) {
        allMarkers[allMarkers.length] = placeMarker(tempPosition, "", m.name, "", m.icon, m.userid)
        map.fitBounds(bounds);                  // I THINK FIT BOUNDS AFTER ADDING A NEW PERSON!
        // document.getElementById('status').innerHTML = m.name + " just joined the map!";
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
        // document.getElementById('status').innerHTML = allMarkers[x].title + " just left the map!";
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
