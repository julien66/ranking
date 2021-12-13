$( document ).ready(function() {
    var map = L.map('map').setView([47.5143, 14,0116], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var buildIcon = function(color) {
        const markerHtmlStyles = `
            background-color: ${color};
            width: 2rem;
            height: 2rem;
            display: block;
            left: -1.5rem;
            top: -1.5rem;
            position: relative;
            border-radius: 2rem 2rem 10;
            box-shadow : 0px 0px 10px #000;
            transform: rotate(45deg);
            border: 1px solid #FFFFFF`

        return icon = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<span style="${markerHtmlStyles}" />`
        });
    };

    $.get( "/events/json", function( events ) {
        for (i = 0; i < events.length; i++) {
            L.geoJSON(events[i].latlon, {
                pointToLayer: function (feature, latlng) {
                    feature.event = events[i];
                    return L.marker(latlng, {icon : buildIcon(events[i]['eventType.color'])});
                },
                onEachFeature:onEachFeature
            }).addTo(map);
        }
    });

    function onEachFeature(feature, layer) {
        console.log(feature);
        layer.bindPopup(formatPopup(feature.event));
    }

    function formatPopup(event) {
        return '<h3>' + event.name + '</h3><div><a href="' + event.website + '">' + event.website + '</a></div>';
    }
});