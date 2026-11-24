window.onload = getData;

let map;
let bound = null;
let libraryData = null;
let markers = [];
let openInfoWindow = null;
let gus = "";

const url = "/.netlify/functions/library?start=";

async function getData() {
    try {
        const response = await fetch(url + "1&end=1000");
        const data = await response.json();

        libraryData = data;

        if (map) {
            updateLibrary(libraryData);
        }

    } catch (error) {
        console.error("도서관 데이터 요청 오류:", error);
    }
}

function handleRefresh() {
    if (map) {
        addBound(3000);

        if (libraryData) {
            updateLibrary(libraryData);
        }
    }
}

function find() {
    const gu = document.getElementById("gu");
    gus = gu.value;

    const coordinates = {
        "강남구": [37.4968488, 127.0679394],
        "강동구": [37.5492994, 127.1464275],
        "강북구": [37.6482131, 127.0164069],
        "강서구": [37.552593, 126.85051],
        "관악구": [37.4654529, 126.9442478],
        "광진구": [37.5388, 127.083445],
        "구로구": [37.495765, 126.8578697],
        "금천구": [37.4599896, 126.9012665],
        "노원구": [37.6541956, 127.0769692],
        "도봉구": [37.6662325, 127.0298724],
        "동대문구": [37.5835755, 127.0505528],
        "동작구": [37.4971121, 126.944378],
        "마포구": [37.5615964, 126.9086431],
        "서대문구": [37.583312, 126.9356601],
        "서초구": [37.483574, 127.032661],
        "성동구": [37.5508768, 127.0408952],
        "성북구": [37.6023295, 127.025236],
        "송파구": [37.504741, 127.1144649],
        "양천구": [37.527432, 126.8558783],
        "영등포구": [37.525423, 126.896395],
        "용산구": [37.5305208, 126.9809672],
        "은평구": [37.6175107, 126.9249166],
        "종로구": [37.6009106, 126.9835817],
        "중구": [37.5576747, 126.9941653],
        "중랑구": [37.5950497, 127.0957062]
    };

    const [lat, lng] = coordinates[gus];
    const mapContainer = document.getElementById("map");

    const mapOption = {
        center: new kakao.maps.LatLng(lat, lng),
        level: 7
    };

    if (bound) {
        bound.setMap(null);
        bound = null;
    }

    clearMarkers();

    map = new kakao.maps.Map(mapContainer, mapOption);

    const zoomControl = new kakao.maps.ZoomControl();

    map.addControl(
        zoomControl,
        kakao.maps.ControlPosition.RIGHT
    );

    kakao.maps.event.addListener(map, "dragstart", function() {
        if (bound) {
            bound.setMap(null);
        }

        clearMarkers();
    });

    kakao.maps.event.addListener(map, "dragend", function() {
        handleRefresh();
    });

    handleRefresh();
}

function addBound(radius) {
    if (bound) {
        bound.setMap(null);
    }

    bound = new kakao.maps.Circle({
        center: map.getCenter(),
        radius: radius,
        strokeWeight: 5,
        strokeColor: "#F7D358",
        strokeOpacity: 0.5,
        strokeStyle: "solid",
        fillColor: "#F7FE2E",
        fillOpacity: 0.3,
        zIndex: 1
    });

    bound.setMap(map);
}

function updateLibrary(data) {
    const libraries = data.SeoulPublicLibraryInfo.row;

    let addr = "";

    const center = map.getCenter();

    const position = {
        latitude: center.getLat(),
        longitude: center.getLng()
    };

    clearMarkers();

    for (let i = 0; i < libraries.length; i++) {
        const lib = libraries[i];

        const imageSrc = "images/marker1.png";

        const imageSize = new kakao.maps.Size(27, 40);

        const imageOption = {
            offset: new kakao.maps.Point(14, 28)
        };

        const latitude = Number(lib.XCNTS);
        const longitude = Number(lib.YDNTS);

        const loc = {
            latitude: latitude,
            longitude: longitude
        };

        const km = computeDistance(position, loc);

        if (addr !== lib.ADRES && km <= 3) {
            addr = lib.ADRES;

            addMarker(
                imageSrc,
                imageSize,
                imageOption,
                latitude,
                longitude,
                lib.LBRRY_NAME,
                lib.ADRES,
                lib.TEL_NO,
                lib.FDRM_CLOSE_DATE
            );
        }
    }

    const librariesDiv = document.getElementById("libraries");

    librariesDiv.innerHTML = "";

    for (let i = 0; i < libraries.length; i++) {
        const lib = libraries[i];

        if (lib.CODE_VALUE === gus) {
            const div = document.createElement("div");

            div.className = "row mb-2 p-2";

            div.textContent =
                "[" + lib.CODE_VALUE + "] " + lib.LBRRY_NAME + " ";

            const button = document.createElement("input");

            button.type = "button";
            button.value = "위치";
            button.style.width = "50px";

            button.onclick = function() {
                window.open(
                    "https://www.google.co.kr/maps/search/" +
                    encodeURIComponent(lib.LBRRY_NAME)
                );
            };

            const item = document.createElement("div");
            item.className = "col-12";

            item.textContent = div.textContent;
            div.textContent = "";

            item.appendChild(button);

            if (lib.TEL_NO) {
                item.appendChild(document.createElement("br"));
                item.append("전화번호: " + lib.TEL_NO);
            }

            if (lib.ADRES) {
                item.appendChild(document.createElement("br"));

                item.append(
                    "주소: " + lib.ADRES +
                    " (x: " + lib.XCNTS +
                    ", y: " + lib.YDNTS + ")"
                );
            }

            if (lib.FDRM_CLOSE_DATE) {
                item.appendChild(document.createElement("br"));
                item.append("휴관일: " + lib.FDRM_CLOSE_DATE);
            }

            if (lib.HMPG_URL) {
                item.appendChild(document.createElement("br"));
                item.append("홈페이지: ");

                const link = document.createElement("a");

                link.href = lib.HMPG_URL;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = lib.HMPG_URL;
                link.style.overflowWrap = "anywhere";

                item.appendChild(link);
            }

            div.appendChild(item);

            librariesDiv.insertBefore(
                div,
                librariesDiv.firstChild
            );
        }
    }

    for (let i = 0; i < librariesDiv.children.length; i++) {
        librariesDiv.children[i].classList.add(
            i % 2 === 0 ? "custom-bg-even" : "custom-bg-odd"
        );
    }
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    markers = [];

    if (openInfoWindow) {
        openInfoWindow.close();
        openInfoWindow = null;
    }
}

function addMarker(
    imageSrc,
    imageSize,
    imageOption,
    latitude,
    longitude,
    name,
    address,
    tel,
    closeDay
) {
    const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
    );

    const markerPosition = new kakao.maps.LatLng(
        latitude,
        longitude
    );

    const marker = new kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
        clickable: true,
        zIndex: 7
    });

    marker.setMap(map);
    markers.push(marker);

    const content =
        '<div class="bg-primary text-white p-2" ' +
        'style="width:260px; font-size:12px; line-height:1.5;">' +
        '도서관: <b>' + name + '</b><br>' +
        '주소: ' + address + '<br>' +
        '전화번호: ' + tel + '<br>' +
        '휴관일: <span style="color:red;">' + closeDay + '</span>' +
        '</div>';

    const infowindow = new kakao.maps.InfoWindow({
        position: markerPosition,
        content: content,
        removable: true,
        zIndex: 10
    });

    kakao.maps.event.addListener(marker, "click", function() {
        if (openInfoWindow) {
            openInfoWindow.close();
        }

        infowindow.open(map, marker);
        openInfoWindow = infowindow;
    });
}

function computeDistance(startCoords, destCoords) {
    const startLatRads = degreesToRadians(startCoords.latitude);
    const startLongRads = degreesToRadians(startCoords.longitude);

    const destLatRads = degreesToRadians(destCoords.latitude);
    const destLongRads = degreesToRadians(destCoords.longitude);

    const Radius = 6371;

    const distance = Math.acos(
        Math.sin(startLatRads) * Math.sin(destLatRads) +
        Math.cos(startLatRads) * Math.cos(destLatRads) *
        Math.cos(startLongRads - destLongRads)
    ) * Radius;

    return distance;
}

function degreesToRadians(degrees) {
    const radians = (degrees * Math.PI) / 180;
    return radians;
}

function go_top() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.addEventListener("resize", function() {
    if (map) {
        const center = map.getCenter();
        map.relayout();
        map.setCenter(center);
    }
});