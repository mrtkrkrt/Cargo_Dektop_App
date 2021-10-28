var directionDisplay, directionService;
$: mongodb = require("mongodb");

function initMap() {

    let mongocuk = mongodb.MongoClient;
    let url = "mongodb+srv://admin:admin@muratkarakurt.9ergo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    clearDatabase();

    document.getElementById("wholeMap").style.display = "none";
    document.getElementById("signForm").style.display = "none";
    //document.getElementById("changePassword").style.display = "none";
    document.getElementById("hide-pass").style.display = "none";
    document.getElementById("deliveryForm").style.display = "none";
    localStorage.clear();

    document.getElementById("signButton").addEventListener("click", (e) => {
        e.preventDefault();
        signIn();
    })
    document.getElementById("loginButton").addEventListener("click", (e) => {
        e.preventDefault()
        login();
    })

    let markers = [],
        markerCount = 1,
        distances = [],
        currentId = 0,
        marker2 = [],
        isFirst = true,
        user = "",
        listElements = [],
        deleteMarkersId = [];
    let pathReal = "null";

    let mapWindow = window.open("userInterface.html", "");

    window.addEventListener("message", (event) => {
        localStorage.setItem("markers", JSON.stringify(marker2));
        localStorage.setItem("path", (pathReal));
    }, false)

    directionDisplay = new google.maps.DirectionsRenderer();
    directionService = new google.maps.DirectionsService();

    const map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 40.761838,
            lng: 29.922127
        },
        zoom: 14
    });

    const markerStart = new google.maps.Marker({
        position: {
            lat: 40.761838,
            lng: 29.922127
        },
        map: map,
        icon: "mesi.png"
    });

    addMarkerToList(0, "Başlangıç Noktası");
    addMarkerToDatabase(markerStart.position, "Başlangıç Noktası");

    directionDisplay.setMap(map);
    markers.push([0, markerStart, markerStart.position]);
    marker2.push([{
        "index": 0
    }, markerStart.position]);
    window.postMessage("message");

    map.addListener("click", (event) => {
        const marker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            label: markerCount.toString()
        });
        addMarkerToDatabase(event.latLng, false);
        markers.push([markerCount, marker, event.latLng]);
        marker2.push([{
            "index": markerCount
        }, event.latLng]);
        calcRoute();
        window.postMessage("message");
        let opt = document.createElement("option");
        opt.value = markerCount;
        opt.innerHTML = markerCount.toString() + " Nolu Marker";
        document.getElementById("select").appendChild(opt);
        addMarkerToList(markerCount);
        markerCount++;
    });

    document.getElementById("calcRouteButton").addEventListener("click", () => {
        drawRouteOnMap();
    });

    document.getElementById("postmanForwardButton").addEventListener("click", () => {
        forwardPostman();
        window.postMessage("message");
    });

    document.getElementById("changePass").addEventListener("click", () => {
        let pass1 = document.getElementById("pass1").value;
        let pass2 = document.getElementById("pass2").value;

        if (pass1 !== pass2) {
            alert("LLütfen şifreleri aynı giriniz!!!");
            return;
        }

        mongocuk.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myquery = {
                username: user
            };
            var newvalues = {
                $set: {
                    username: user,
                    password: pass1
                }
            };
            dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
                alert("Şifre Değiştirildi")
                db.close();
            });
        });

        document.getElementById("pass1").value = "";
        document.getElementById("pass2").value = "";
    });

    document.getElementById("addMarkerOnMap").addEventListener("click", () => {
        let lat = Number(document.getElementById("lat").value);
        let lng = Number(document.getElementById("lng").value);

        console.log(lat, lng);

        let myLatlng = new google.maps.LatLng(lat, lng);

        const marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            label: markerCount.toString()
        });
        addMarkerToDatabase(myLatlng, false);
        markers.push([markerCount, marker, myLatlng]);
        marker2.push([{
            "index": markerCount
        }, myLatlng]);
        calcRoute();
        window.postMessage("message");
        document.getElementById("lat").value = "";
        document.getElementById("lng").value = "";
        let opt = document.createElement("option");
        opt.value = markerCount;
        opt.innerHTML = markerCount.toString() + " Nolu Marker";
        document.getElementById("select").appendChild(opt);
        addMarkerToList(markerCount);
        markerCount++;
    });

    document.getElementById("removeMarkerButton").addEventListener("click", () => {
        console.log("Silinecek Marker ID : ", document.getElementById("select").value);
        removeMarker(document.getElementById("select").value);
    });

    function drawRouteOnMap(){
        let temp = getMarker(currentId);
        let temp2 = getArray(temp);
        let perms = permute(temp2);
        perms.forEach(element => {
            element.unshift(markers[0]);
        });
        let path = findMinPath(perms);
        let ids = drawRoute(path)
        pathReal = ids;
        window.postMessage("message");
    }

    function forwardPostman() {
        let temp = getMarker(currentId);
        let temp2 = getArray(temp);
        let perms = permute(temp2);
        perms.forEach(element => {
            element.unshift(temp);
        });
        let path = findMinPath(perms);
        let ids = drawRoute(path);
        pathReal = ids;
        window.postMessage("message");
        currentId = ids[1];
        changeMarkerState(ids[1]);
        deleteMarker(ids[0]);
        passMarker(ids[1]);

        if (markers.length >= 1) {
            setTimeout(() => {
                temp = getMarker(currentId);
                let temp2 = getArray(temp);
                let perms = permute(temp2);
                perms.forEach(element => {
                    element.unshift(temp);
                });
                let path = findMinPath(perms);
                let ids = drawRoute(path);
                pathReal = ids;
                window.postMessage("message");
            }, 1000)
            isFirst = false;
        } else {}
    }

    function getArray(temp) {
        let wp = [];
        for (let i = 0; i < markers.length; i++) {
            if (markers[i] != temp) wp.push(markers[i]);
        }
        return wp;
    }

    function deleteMarker(markerId) {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i][0] == markerId) {
                markers[i][1].setMap(null);
                const index = markers.indexOf(markers[i]);
                markers.splice(index, 1);
            }
        }
    }

    function passMarker(markerId) {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i][0] == markerId) {
                markers[i][1].setIcon("mesi.png");
            }
        }
    }

    function findMinPath(permList) {
        let maxDist = Number.POSITIVE_INFINITY;
        let minPath;
        for (let i = 0; i < permList.length; i++) {
            let temp = 0;
            for (let j = 0; j < permList[i].length - 1; j++) {
                let id = permList[i][j][0] + "_" + permList[i][j + 1][0];
                temp += getDistance(id);
            }
            if (temp < maxDist) {
                maxDist = temp;
                minPath = permList[i];
            }
        }
        return minPath;
    }

    function getDistance(id) {
        for (let i = 0; i < distances.length; i++) {
            if (distances[i].key == id || distances[i].key == id.split("").reverse().join("")) return distances[i].distance;
        }
    }

    function getMarker(id) {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i][0] == id) return markers[i];
        }
    }

    function drawRoute(path) {
        try {
            let ids = []
            path.forEach(element => {
                ids.push(element[0]);
            });

            let start = path.shift();
            let destination = path.pop();

            let waypoints = [];
            for (let i = 0; i < path.length; i++) {
                waypoints.push({
                    location: path[i][2],
                    stopover: true
                })
            }
            var request = {
                origin: start[2],
                destination: destination[2],
                optimizeWaypoints: true,
                travelMode: "DRIVING",
                waypoints: waypoints
            };
            directionService.route(request, (response, status) => {
                directionDisplay.setDirections(response);
            });

            return ids
        }catch{
            alert("Kargo Dağıtımı Tamamlandı!!!");
        }

    }

    function permute(nums) {
        let result = [];
        if (nums.length === 0) return [];
        if (nums.length === 1) return [nums];
        for (let i = 0; i < nums.length; i++) {
            const currentNum = nums[i];
            const remainingNums = nums.slice(0, i).concat(nums.slice(i + 1));
            const remainingNumsPermuted = permute(remainingNums);
            for (let j = 0; j < remainingNumsPermuted.length; j++) {
                const permutedArray = [currentNum].concat(remainingNumsPermuted[j]);
                result.push(permutedArray);
            }
        }
        return result;
    }

    function calcRoute() {
        let delay = 0;

        if (markers.length > 0) {
            for (let i = 0; i < markers.length - 1; i++) {
                setTimeout(() => {
                    let key = (markers[i][0]) + "_" + (markerCount - 1);
                    let request = {
                        origin: markers[i][2],
                        destination: markers[markers.length - 1][2],
                        travelMode: google.maps.TravelMode.DRIVING,
                    };
                    directionService.route(request, (response, status) => {
                        console.log(key, "=>", response.routes[0].legs[0].distance.value);
                        distances.push({
                            "key": key,
                            "distance": response.routes[0].legs[0].distance.value
                        });
                    });
                }, delay);
                delay += 400;
            }
        }
    }

    function login() {
        let username = document.getElementById("usernameLoginInput").value;
        let pass = document.getElementById("passwordLoginInput").value;

        mongocuk.connect(url, function (err, db) {
            if (err) throw err;
            let dbo = db.db("mydb");
            dbo.collection("users").find({
                "username": username,
                "password": pass
            }).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    user = username;
                    document.getElementById("loginForm").style.display = "none";
                    document.getElementById("wholeMap").style.display = "initial";
                    document.getElementById("changePassword").style.display = "initial"
                    document.getElementById("login-display").style.display = "none"
                    console.log("Giriş Yapıldı!");
                    document.getElementById("hide-pass").style.display = "initial"
                    document.getElementById("deliveryForm").style.display = "initial";
                }else{
                    alert("Hatalı Giriş!!!");
                }
                db.close();
            });
        });
    }

    function signIn() {
        document.getElementById("signForm").style.display = "initial";
        document.getElementById("loginForm").style.display = "none";

        document.getElementById("recordButton").addEventListener("click", (e) => {
            e.preventDefault();

            let username = document.getElementById("usernameSignInput").value;
            let pass = document.getElementById("passwordSignInput").value;

            mongocuk.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");
                var myobj = {
                    "username": username,
                    "password": pass
                };
                dbo.collection("users").insertOne(myobj, function (err, res) {
                    if (err) throw err;
                    db.close();
                });
            });
            document.getElementById("signForm").style.display = "none";
            document.getElementById("loginForm").style.display = "initial";
            console.log("Kullanıcı Eklendi");
        })
    }

    function removeMarker(id) {
        let options = document.querySelectorAll("option");
        for (let i = 0; i < options.length; i++) {
            if (options[i].value == id && id != currentId) {
                document.getElementById("select").removeChild(options[i]);
                break;
            }else{
                alert("Bulunduğunuz Noktayı silemezsiniz!!!");
                return;
            }
        }

        for (let i = 0; i < markers.length; i++) {
            if (markers[i][0] == id) {
                markers[i][1].setMap(null);
                markers.splice(i, 1);
                marker2.splice(i, 1);
                deleteMarkersId.push(id);
                changeMarkerState(id, "Teslim Edilmedi (Silindi)")
                localStorage.setItem("delete", deleteMarkersId);
            }
        }
        window.postMessage("message");
    }

    function addMarkerToList(id, teslimat = "Teslim Edilmedi") {
        let list = document.createElement("ul");
        list.classList.add("list-group");
        list.classList.add("list-group-horizontal");
        let idLi = document.createElement("li");
        idLi.innerHTML = id;
        let delivery = document.createElement("li");
        idLi.classList.add("list-group-item");
        delivery.classList.add("list-group-item");
        delivery.innerHTML = teslimat;
        list.appendChild(idLi);
        list.appendChild(delivery);
        document.getElementById("deliveryForm").appendChild(list);
        listElements.push([id, delivery]);
    }

    function changeMarkerState(id, state = "Teslim Edildi") {
        let databaseState = (state == "Teslim Edildi") ? true : false;
        for (let i = 0; i < listElements.length; i++) {
            if (listElements[i][0] == id){
                listElements[i][1].innerHTML = state;
            } 
        }
        if(databaseState){
            mongocuk.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("mydb");
                var myquery = { id: id };
                var newvalues = { $set: {state : true} };
                dbo.collection("Locations").updateOne(myquery, newvalues, function(err, res) {
                  if (err) throw err;
                  console.log("1 document updated");
                  db.close();
                });
              });
        }
    }

    function addMarkerToDatabase(coord, state = false) {
        mongocuk.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myobj = {
                id: markerCount - 1,
                lat: coord.lat(),
                lng: coord.lng(),
                state : state
            };
            dbo.collection("Locations").insertOne(myobj, function (err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        });
    }

    function clearDatabase() {
        mongocuk.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("Locations").deleteMany({}, function (err, obj) {
                if (err) throw err;
                db.close();
            });
        });
    }
}