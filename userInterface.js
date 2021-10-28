var directionDisplay, directionService;

function initMap() {

    let mrkrs = [],
        markerCount = 0,
        lastMarkerCount = 0,
        lastDeleteCount = 0;

    directionDisplay = new google.maps.DirectionsRenderer();
    directionService = new google.maps.DirectionsService();

    localStorage.setItem("path", "null");
    localStorage.setItem("delete", []);

    const map = new google.maps.Map(document.getElementById("map1"), {
        center: {
            lat: 40.761838,

            lng: 29.922127
        },
        zoom: 14
    });

    directionDisplay.setMap(map);
    let markers, markersTemp = [],
        path, pathTemp = "null",
        deleteMarkersId, deleteTemp = [];

    setInterval(() => {
        if (mrkrs.length == 1) mrkrs[0][1].setIcon("mesi.png");
        markers = JSON.parse(localStorage.getItem("markers"));
        if (markers.length != markersTemp.length) {
            addMarkerOnMap();
            markersTemp = markers;
        }
        console.log(markers.length);
        path = (localStorage.getItem("path"));

        if (path != pathTemp) {
            path = path.split(",");
            pathTemp = path.map(Number);
            setTimeout(() => {
                drawPathOnMap(pathTemp);
                getMesi(pathTemp[0]);
            }, 100)
        }
        deleteMarkersId =  localStorage.getItem("delete");
        if (deleteMarkersId.length != deleteTemp) {
            removeMarkers();
        }
    }, 1000);

    function getMesi(id) {
        for (let i = 0; i < mrkrs.length; i++) {
            if (mrkrs[i][0] == id) mrkrs[i][1].setIcon("mesi.png");
        }
    }

    function drawPathOnMap(path) {
        markers = JSON.parse(localStorage.getItem("markers"));
        console.log(markers);

        let pathMarkers = [];
        console.log(pathTemp);

        for (let i = 0; i < path.length; i++) {
            pathMarkers.push(getMarker(pathTemp[i]));
        }

        let start = pathMarkers.shift();
        let dest = pathMarkers.pop();

        let waypoints = [];
        for (let i = 0; i < pathMarkers.length; i++) {
            waypoints.push({
                location: pathMarkers[i][1],
                stopover: true
            })
        }

        var request = {
            origin: start[1],
            destination: dest[1],
            optimizeWaypoints: true,
            travelMode: "DRIVING",
            waypoints: waypoints
        };
        directionService.route(request, (response, status) => {
            directionDisplay.setDirections(response);
        });
        setTimeout(() => {
            checkMarkers(path);
        }, 100)
    }

    function getMarker(id) {
        markers = JSON.parse(localStorage.getItem("markers"));
        for (let i = 0; i < markers.length; i++) {
            if (markers[i][0]["index"] == id) return markers[i];
        }
    }

    function addMarkerOnMap(marker) {
        for (let i = lastMarkerCount; i < markers.length; i++) {
            const marker = new google.maps.Marker({
                position: markers[i][1],
                map: map
            })
            mrkrs.push([markerCount, marker]);
            markerCount++;
        }
        lastMarkerCount = markers.length;
    }

    function checkMarkers(path) {
        for (let i = 0; i < mrkrs.length; i++) {
            if (!pathTemp.includes(mrkrs[i][0])) mrkrs[i][1].setMap(null);
        }
    }

    function removeMarkers() {
        let idArray = localStorage.getItem("delete");
        idArray = idArray.split(",");
        idArray = idArray.map(Number);
        console.log("Silinecekelr", idArray);
        for(let i = lastDeleteCount; i < idArray.length; i++){
            for (let i = 0; i < mrkrs.length; i++) {
                if (mrkrs[i][0] == id) mrkrs[i][1].setMap(null);
            }
        }
        lastDeleteCount = idArray.length;
    }
}