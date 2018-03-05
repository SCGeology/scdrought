var map = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: false
    }).setView([33.6, -81.0], 7);

 var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    }).addTo(map);

function getColor(d) {
    return d == 'Normal' ? '#91ed8e':
           d == 'Incipient' ? '#f2f079':
           d == 'Moderate' ? '#ffae35':
           d == 'Severe' ? 'indianred':
                           '#e171f7';
} 

function style(feature){
    return {
        fillColor:getColor(feature.properties.STATUS),
        weight:1,
        opacity:0.9,
        color:'white',
        fillOpacity:0.8
    };
}
    
var statuslayer = L.geoJson(counties, {
    style:style,
}).addTo(map);

statuslayer.eachLayer(function (layer){
    layer.bindPopup(layer.feature.properties.CNTYNAME + ": " + layer.feature.properties.STATUS)
});