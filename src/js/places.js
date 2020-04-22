const loadPlaces = function (method,position,destination) {
    // COMMENT FOLLOWING LINE IF YOU WANT TO USE STATIC DATA AND ADD COORDINATES IN THE FOLLOWING 'PLACES' ARRAY

    const PLACES = [
        {
            name: "GS25",
            location: {
                lat: 37.499662, // add here latitude if using static data
                lng: 127.0940758, // add here longitude if using static data
            }
        },
        {
            name: "롯데월드타워",
            location: {
                lat: 37.513704, // add here latitude if using static data
                lng: 127.103978, // add here longitude if using static data
            }
        },
        {
            name: "잠원초등학교",
            location: {
                lat: 37.518130, // add here latitude if using static data
                lng: 127.100007, // add here longitude if using static data
            }
        },
        {
            name: "어린이교통공원",
            location: {
                lat: 37.516099, // add here latitude if using static data
                lng: 127.101737, // add here longitude if using static data
            }
        }
    ];

    if (method === 'kakao') {
        return loadPathFromServer(position,destination);
    };
    
    return Promise.resolve(PLACES);
};

function getPosition(point){
    const camera = document.querySelector('[gps-camera]').components['gps-camera'];
    //console.log(camera.currentCoords);
    let position = { x: 0, y: 0, z: 0 };

        // update position.x
    let dstCoords = {
        longitude: point.longitude,
        latitude: camera.currentCoords.latitude,
    };

    position.x = camera.computeDistanceMeters(camera.currentCoords, dstCoords);
    position.x *= point.longitude > camera.currentCoords.longitude ? 1 : -1;

    // update position.z
    dstCoords = {
        longitude: camera.currentCoords.longitude,
        latitude: point.latitude,
    };

    position.z = camera.computeDistanceMeters(camera.currentCoords, dstCoords);
    position.z *= point.latitude > camera.currentCoords.latitude ? -1 : 1;

    if (position.y !== 0) {
        var altitude = camera.currentCoords.altitude !== undefined ? camera.currentCoords.altitude : 0;
        position.y = position.y - altitude;
    }

    console.log('translated to '+AFRAME.utils.coordinates.stringify(position));
    return position;
}

function loadPathFromServer(position,destination){
    return new Promise(function(resolve,reject){
        let PLACES = new Array();
        let placeInfo = new Object();
        let location = new Object();
        
        const pathAPi = `/getpath/${position.latitude}/${position.longitude}/${destination.latitude}/${destination.longitude}`;
        console.log(pathAPi);
        
        fetch(pathAPi)
            .then((res) => {
                if (res.status === 200 || res.status === 201) { 
                    return res.text()
                }
                else {
                    console.log(res.statusText);
                }
            })
            .then(text => {
                //console.log(JSON.parse(text));
                resolve(JSON.parse(text));
            })
            .catch((error) =>{
                console.error(error);
            })
    });
}

window.onload = () => {
    const scene = document.querySelector('a-scene');
    var kind = "";
    kind = getParameterByName('kind');
    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {
        console.log("현재 내위치는 : " +position.coords.latitude+", 경도: " + position.coords.longitude + "에 있습니다");

        let destination = new Object();
        destination.name = getParameterByName('name');
        destination.latitude = getParameterByName('lat');
        destination.longitude = getParameterByName('lng');
                
        //add destination

        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${destination.latitude}; longitude: ${destination.longitude}`);
        icon.setAttribute('name', destination.name);
        icon.setAttribute('src', '/img/map-marker.png');
        icon.setAttribute('scale', '5, 5');
        scene.appendChild(icon);

        // get points from path API and add points

        loadPlaces(kind,position.coords,destination)
            .then((points) => {
                // add point icon
                points.point.forEach((point) => {
                    console.log(point);
                    const icon = document.createElement('a-image');
                    const position = AFRAME.utils.coordinates.stringify(getPosition(point.lookAt));
                    icon.setAttribute('gps-entity-place', `latitude: ${point.latitude}; longitude: ${point.longitude}`);
                    icon.setAttribute('dest', point.dest);
                    icon.setAttribute('look-at',position);
                    //gltf-model="url(/path/to/tree.gltf)"
                    icon.setAttribute('gltf-model', 'url(/assets/objects/arrow.gltf)');
                    icon.setAttribute('scale', '0.5 0.5 0.5');
                    scene.appendChild(icon);
                });  
            })
    },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};

function computeDistance(startCoords, destlat, destlng) {
    var startLatRads = degreesToRadians(startCoords.latitude);
    var startLongRads = degreesToRadians(startCoords.longitude);
    var destLatRads = degreesToRadians(destlat);
    var destLongRads = degreesToRadians(destlng);

    var Radius = 6371; //지구의 반경(km)
    var distance = Math.ceil(Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) + 
                    Math.cos(startLatRads) * Math.cos(destLatRads) *
                    Math.cos(startLongRads - destLongRads)) * Radius * 1000);

    return distance;
};

function degreesToRadians(degrees) {
    radians = (degrees * Math.PI)/180;
    return radians;
};

function radiansToDegrees(radians) {
    degrees = (radians * 180)/Math.PI;
    return degrees;
};

function calcAngleDegrees(x, y) {
    angle = Math.atan2(y, x) * 180 / Math.PI;
    if(angle < 0 ) angle += 360;
    return angle;
};

function calcDistance(positionA , positionB) {
    dist_x = positionA.x-positionB.x;
    dist_y = positionA.y-positionB.y;
    dist_z = positionA.z-positionB.z;
    dist = Math.sqrt(Math.pow(dist_x,2)+Math.pow(dist_y,2)+Math.pow(dist_z,2));

    return dist;
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
