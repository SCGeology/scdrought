var map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: false
}).setView([33.6, -81.0], 7);

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
}).addTo(map);

map.dragging.disable();

var data = "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/drought_status/FeatureServer/0"

var fieldNames = []
var latest

var statuslayer = L.esri.featureLayer({
    url: data
}).addTo(map);

// use esri leaflet query to return counts of counties for each category 
var statusQuery = L.esri.query({
    url: data
});

function getColor(d) {
    return d == 'Normal' ? '#91ed8e' :
        d == 'Incipient' ? '#f2f079' :
        d == 'Moderate' ? '#ffae35' :
        d == 'Severe' ? 'indianred' :
        '#e171f7';
}

function getCount(c, f) {
    statusQuery.where(f + "='" + c + "'").count(function(error, count, response) {
        $("#" + c).text(count);
        $("#" + c + "-h > .graph").text("");
        for (i = 0; i < count; i++) {
            $("#" + c + "-h > .graph").append("|");
        }
    });
}

function getStats(f) {
    var cat = ['Normal', 'Incipient', 'Moderate', 'Severe', 'Extreme']
    for (i = 0; i < 5; i++) {
        getCount(cat[i], f);
    }
}

function setLayer(f) {
    statuslayer.setStyle(function style(feature) {
        return {
            fillColor: getColor(feature.properties[f]),
            weight: 1,
            color: "white",
            opacity: 0.9,
            fillOpacity: 0.7
        };
    });
    statuslayer.bindTooltip(function(layer) {
        return L.Util.template('<span style="font-weight:bold">{CNTYNAME}</span>:<br>{' + f + '}', layer.feature.properties);
    });
}

function prettydate(field){
    return [field.substring(6,8), field.substring(8), field.substring(2,6)].join("-")
}

function setSliderValues(l) {
    $("#archived").prop("max", fieldNames.length-1)
    $("#archived").prop("max", fieldNames.length-1)
    $("#date").text(prettydate(l));
}

function getLatest() {
    statuslayer.metadata(function(error, metadata) {
        $.each(metadata.fields, function(i, v) {
            if (v.name.match("^s_")) {
                fieldNames.push(v.name)
            }
        });
        latest = fieldNames.sort()[fieldNames.length - 1];
        setLayer(latest);
        getStats(latest);
        setSliderValues(latest);
    });
}
//call to get data updated
getLatest();

//slider stuff
$("#archived").change(function() {
    setLayer(fieldNames[this.value]);
    getStats(fieldNames[this.value]);
    $("#date").text(prettydate(fieldNames[this.value]));
    if (this.value != fieldNames.length-1){
        $("#qualifier").text("Archived");
        console.log("woo")
    } else {
        $("#qualifier").text("Current");
        console.log("wee")
    }
});