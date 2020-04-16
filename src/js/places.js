const loadPlaces = function (method) {
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
        var KPLACES = new Array();

        var placeInfo = new Object();
        var location = new Object();
        placeInfo.name = getParameterByName('name');
        location.lat = getParameterByName('lat');
        location.lng = getParameterByName('lng');
        placeInfo.location = location;

        KPLACES.push(placeInfo);

        console.log(KPLACES);

        return Promise.resolve(KPLACES);
    };
    
    return Promise.resolve(PLACES);
};


window.onload = () => {
    const scene = document.querySelector('a-scene');
    var kind = "";
    kind = getParameterByName('kind');
    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {
        console.log("현재 내위치는 : " +position.coords.latitude+", 경도: " + position.coords.longitude + "에 있습니다");

        // then use it to load from remote APIs some places nearby
        loadPlaces(kind)
            .then((places) => {
                places.forEach((place) => {
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;

                    // add place icon
                    const icon = document.createElement('a-image');
                    icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
                    icon.setAttribute('name', place.name);
                    icon.setAttribute('src', '/assets/map-marker.png');

                    // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
                    icon.setAttribute('scale', '2, 2');

                    // add place label
                    label = document.getElementById('place-name');
                    label.setAttribute('name',place.name);
                    label.setAttribute('latitude', latitude); 
                    label.setAttribute('longitude', longitude);
                    label.parentElement.style.visibility="visible";

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
