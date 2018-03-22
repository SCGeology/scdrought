var map = L.map('map', {
    zoomControl: false,
    maxZoom: 8,
    minZoom: 6,
    zoomDelta: 0.5,
    doubleClickZoom:'center',
    maxBounds:[[37, -85],[30.5,-77]]
}).fitBounds([[35.3, -83.4],[31.9,-78.44]]);

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
}).addTo(map);

var data = "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/drought_status/FeatureServer/0"

var fieldNames = []
var latest
var oldest
var position = 0

var statuslayer = L.esri.featureLayer({
    url: data
}).addTo(map);

// use esri leaflet query to return counts of counties for each category 
var statusQuery = L.esri.query({
    url: data
});

function getColor(d) {
    return d == 'Normal' ? '#ebf4c3' :
        d == 'Incipient' ? '#fdcc8a' :
        d == 'Moderate' ? '#fc8d59' :
        d == 'Severe' ? '#e34a33' :
        '#b30000';
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

function setDropdown(l) {
    $(fieldNames).each(function(i){
        if (i >0){
            $("#archive-select").append('<option class="archived-status" value="'+fieldNames[i]+'">'+prettydate(fieldNames[i])+'</option>');
        }
    });
    $("#date").text(prettydate(l));
}

function getLatest() {
    statuslayer.metadata(function(error, metadata) {
        $.each(metadata.fields, function(i, v) {
            if (v.name.match("^s_")) {
                fieldNames.push(v.name)
            }
        });
        latest = fieldNames.reverse()[0];
        oldest = fieldNames[fieldNames.length-1]
        setLayer(latest);
        getStats(latest);
        setDropdown(latest);
    });
}
//call to get data updated
getLatest();

$("#archive-select").change(function(){
    if (this.value == "current"){
        setLayer(latest);
        getStats(latest);
        $("#date").text(prettydate(latest));
        $("#forward").prop("disabled", true);
    } else {
        setLayer(this.value);
        getStats(this.value);
        $("#date").text(prettydate(this.value));
        $("#forward").prop("disabled", false)
    }
    if (this.value == oldest){
        $("#backward").prop("disabled", true);
    } else {
        $("#backward").prop("disabled", false)
    }
});

$("#forward").click(function(){
    $("#archive-select > option:selected")
        .prop("selected", false)
        .prev()
        .prop("selected", true)
        .trigger("change");
});

$("#backward").click(function(){
    $("#archive-select > option:selected")
        .prop("selected", false)
        .next()
        .prop("selected", true)
        .trigger("change");
});
