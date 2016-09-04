var map;
var infoWindow;
var bounds;
var myPosition;
var myMarker;
var myWatcher;
var mainloopcount = 0;
var allMarkers = [];
var modal;
var close;

function mainLoop() {
  setTimeout(function () {
    gon.watch("markerArray", function(result){
      if (result.length == 0) {
        // map.fitBounds(bounds);                          // 
        map.setCenter(bounds.getCenter());              // TRACK YOUR MARKER IF YOU ARE ALONE IN YOUR GROUP
      } else {
        updateMarkers(result);
      }
    });
    gon.watch("user", function(result){
      if (result.room == result.id) {
        document.getElementById("homebutton").style.display = "none";
        document.getElementById("invitebutton").style.display = "initial";
        document.getElementById("removebutton").style.display = "initial";
      } else {
        document.getElementById("homebutton").style.display = "initial";
        document.getElementById("invitebutton").style.display = "none";
        document.getElementById("removebutton").style.display = "none";
      }
      if ((result.room != result.invite) && (result.invite != result.id)) {
        gon.watch("inviter", function(result2){
          displayInvite({room: result2.id, displayname: result2.displayname});
        });
      }
      if (result.declined != result.id) {
        gon.watch("declinedUser", function(result2) {
          document.getElementById("status").innerHTML = "<p class=\"alert error alert-box\" id=\"decline\">" + result2.displayname + " declined your invitation!</p>";
          setTimeout(fade_out_decline, 5000);
        });
        updateGeneric({declined: result.id});

      }
      if (result.removed != result.id) {
        gon.watch("removedUser", function(result2) {
          document.getElementById("status").innerHTML = "<p class=\"alert error alert-box\" id=\"removed\">" + result2.displayname + " removed you from their group!</p>";
          setTimeout(fade_out_removed, 5000);
          bounds = new google.maps.LatLngBounds();  // CREATE BOUNDS OBJECT, SET TO GLOBAL VARIABLE
          bounds.extend(myMarker.position);
          gon.watch("markerArray", function(results) { 
            updateMarkers(results); 
            map.fitBounds(bounds);                  // ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
            map.setCenter(myPosition); 
            document.getElementById("roomid").innerHTML = "Your Group";
            updateGeneric({removed: result.id});
          });
        });
      }
    });
    mainloopcount += 1;
    mainLoop();
  }, 2500);
}

function initMap() {
	var updates = 0;
 	bounds = new google.maps.LatLngBounds();	// CREATE BOUNDS OBJECT, SET TO GLOBAL VARIABLE

  gon.watch("user", function(result){
    if (result.room == result.id) {
      document.getElementById("homebutton").style.display = "none";
      document.getElementById("invitebutton").style.display = "initial";
      document.getElementById("removebutton").style.display = "initial";
    } else {
      document.getElementById("homebutton").style.display = "initial";
      document.getElementById("invitebutton").style.display = "none";
      document.getElementById("removebutton").style.display = "none";
    }
  });

 	getMyLocation(function () {
    var options = {
                    enableHighAccuracy: true,
                    timeout: Infinity,
                    maximumAge: 2500
                  }
  	
    createMap();														// CREATES MAP AFTER getMyLocation SETS myPosition

    updatePosition();                        // SEND NEW POSITION TO DATABASE

 		myMarker = placeMarker(myPosition, "", gon.user.displayname, "", gon.user.icon); // SET MY MARKER
 	  if (gon.markerArray) { 
      loadMarkers(gon.markerArray);    
    }						// LOAD OTHER MARKERS (NOT MINE)

    gon.watch("roomName", function(result) {
      document.getElementById("roomid").innerHTML = result;
    });

    document.getElementById("invitebutton").onclick = function(){
      populateUserList({ invite: true, remove: false });
    };

    document.getElementById("homebutton").onclick = function() {
      goHome();
    };

    document.getElementById("removebutton").onclick = function() {
      populateUserList(options = {invite: false, remove: true});
    };

    modal = document.getElementById('myModal');
    userInviting = document.getElementById('userInviting');
    // closeModal = document.getElementsByClassName("close")[0];
    acceptInvite = document.getElementById('acceptInvite');
    declineInvite = document.getElementById('declineInvite');

    modal2 = document.getElementById('myModal2');
    close = document.getElementById('close');

    map.fitBounds(bounds);                 // ZOOM MAP AUTOMATICALLY BASED ON THE BOUNDS
    map.setCenter(bounds.getCenter());              // CENTER MAP ON myPosition

    mainLoop();


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
    $(this).remove();
  });
}

function fade_out_declined() {
  $("#declined").fadeOut(2000, function() { 
    $(this).remove();
  });
}

function fade_out_leftgroup() {
  $("#leftgroup").fadeOut(2000, function() { 
    $(this).remove();
  });
}

function fade_out_invite() {
  $("#invite").fadeOut(2000, function() { 
    $(this).remove();
  });  
}

function fade_out_decline() {
  $("#decline").fadeOut(2000, function() { 
    $(this).remove();
  });
}

function fade_out_removed() {
  $("#removed").fadeOut(2000, function() { 
    $(this).remove();
  });
}

function displayInvite(user) {
  userInviting.innerHTML = user.displayname;
  document.getElementById('myModal').style.display = "block";
  invitingUser = user;

  acceptInvite.onclick = function() {
    updateGeneric(user = { invite: gon.user.id });
    newRoom = invitingUser.room;
    updateGeneric(user = { room: newRoom });
    document.getElementById("roomid").innerHTML = invitingUser.displayname + "'s Group";
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
    document.getElementById("status").innerHTML = "<p class=\"notice success alert-box\" id=\"joined\">You joined " + invitingUser.displayname + "'s group!</p>";
    document.getElementById("homebutton").style.display = "initial";
    document.getElementById("invitebutton").style.display = "none";
    setTimeout(fade_out_joined, 5000);      
  }

  declineInvite.onclick = function() {
    data = { userid: invitingUser.room, declined: gon.user.id };
    $.ajax({          
      data: data,
      url: "updatedeclined",
      type: "PATCH",
      dataType: "json"
    });
    updateGeneric(user = { invite: gon.user.id });
    modal.style.display = "none";
    //document.getElementById("status").innerHTML = "You declined " + invitingUser.name + "'s invitation!"
    document.getElementById("status").innerHTML = "<p class=\"alert error alert-box\" id=\"declined\">You declined " + invitingUser.displayname + "'s invitation!</p>";
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

function populateUserList(options) {
  modal2.style.display = "block";
  if ((options.invite == true) && (options.remove == false)) {      // INVITES ONLY
    document.getElementById("userListHeader").innerHTML = "Choose a user to invite";
    gon.watch("inviteUsers", function(result){
      if (result.length > 0) {
        for(x=0;x<result.length;x+=1){
          document.getElementById("userList").innerHTML += '<li class="userListItem" id="userListItem' + result[x].id + '" onClick="sendInvite({ id: ' + result[x].id + ', displayname: \'' + result[x].displayname + '\' });">' + result[x].displayname + '</li>';
        }
      } else {
        document.getElementById("userListHeader").innerHTML = "No users left to invite to your group!";
      }
    });
  } else if ((options.invite == false) && (options.remove == true)) {   // REMOVE ONLY
    document.getElementById("userListHeader").innerHTML = "Choose a user to remove";
    gon.watch("removeUsers", function(result){
      if (result.length > 0) {
        for(x=0;x<result.length;x+=1){
          document.getElementById("userList").innerHTML += '<li class="userListItem" id="userListItem' + result[x].id + '" onClick="removeUser({ id: ' + result[x].id + ', displayname: \'' + result[x].displayname + '\' });">' + result[x].displayname + '</li>';
        }
      } else {
        document.getElementById("userListHeader").innerHTML = "No users in your group!";
      }
    });

  } else if ((options.invite == true) && (options.remove == true)) {    // BOTH!!!
    document.getElementById("userListHeader").innerHTML = "Choose a user to invite or remove";
  } else { modal2.style.display = "none"; }
  // GET USERS NOT IN ROOM

  close.onclick = function(event) {
    if (event.target == close) {
        modal2.style.display = "none";
        document.getElementById("userList").innerHTML = "";
    }
  }

  window.onclick = function(event) {
    if (event.target == modal2) {
        modal2.style.display = "none";
        document.getElementById("userList").innerHTML = "";
    }
  }
}

function sendInvite(options) {
  if (confirm("Are you sure you would like to invite " + options.displayname + " to your group?")) {
    data = { userid: options.id, invite: gon.user.id };
    $.ajax({          
      data: data,
      url: "updateinvite",
      type: "PATCH",
      dataType: "json"
    });
    document.getElementById("status").innerHTML = "<p class=\"notice success alert-box\" id=\"invite\">You invited " + options.displayname + " to your group!</p>";
    setTimeout(fade_out_invite, 5000);
    $("#userListItem" + options.id).fadeOut(200, function() { 
      $(this).remove();
      if (document.getElementById("userList").innerHTML.trim() == "") {
        document.getElementById("userListHeader").innerHTML = "No users left to invite to your group!";
      }
    });
  } 
}

function removeUser(options) {
  if (confirm("Are you sure you would like to remove " + options.displayname + " from your group?")) {
    data = { userid: options.id, room: options.id };
    $.ajax({          
      data: data,
      url: "updateroom",
      type: "PATCH",
      dataType: "json"
    });
    data2 = { userid: options.id, removed: gon.user.id };
    $.ajax({          
      data: data2,
      url: "updateremoved",
      type: "PATCH",
      dataType: "json"
    });
    document.getElementById("status").innerHTML = "<p class=\"notice success alert-box\" id=\"invite\">You removed " + options.displayname + " from your group!</p>";
    setTimeout(fade_out_invite, 5000);
    $("#userListItem" + options.id).fadeOut(200, function() { 
      $(this).remove();
      if (document.getElementById("userList").innerHTML.trim() == "") {
        document.getElementById("userListHeader").innerHTML = "No users in your group!";
      }
    });
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
            // document.getElementById('status').innerHTML = "Updated " + m.name + "'s position!";
            // map.fitBounds(bounds);                     //  I THINK NO FITBOUNDS AFTER UPDATES (HAPPENS A LOT)
          }
          markerFound = true;
        }
      }
      if (!markerFound) {
        allMarkers[allMarkers.length] = placeMarker(tempPosition, "", m.displayname, "", m.icon, m.userid)
        map.fitBounds(bounds);                  // I THINK FIT BOUNDS AFTER ADDING A NEW PERSON!
        // document.getElementById('status').innerHTML = m.name + " just joined the map!";
        //map.setCenter(myPosition);              // CENTER MAP ON myPosition
        document.getElementById("status").innerHTML = "<p class=\"notice success alert-box\" id=\"joined\">" + m.displayname + " joined the group!</p>";
        setTimeout(fade_out_joined, 5000);      

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
        document.getElementById("status").innerHTML = "<p class=\"alert error alert-box\" id=\"leftgroup\">" + allMarkers[x].title + " left the group!</p>";
        setTimeout(fade_out_leftgroup, 5000);
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
		allMarkers[x] = placeMarker(tempPosition, "", m.displayname, "", m.icon, m.userid);
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
