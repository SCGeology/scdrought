/* TO DO 

Separate out stuff into multiple JS files, if you can. Not all of this needs to be loaded on some pages?

*/
var map = L.map('map', {
    zoomControl: false,
    maxZoom: 8,
    minZoom: 6,
    zoomDelta: 0.5,
    doubleClickZoom:'center',
    wheelPxPerZoomLevel:100,
    maxBounds:[[37, -85],[30.5,-77]]
}).fitBounds([[35.3, -83.4],[31.9,-78.44]]);

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
}).addTo(map);

var data = "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/drought_status/FeatureServer/0"

var fieldNames = [],
 latest,
 oldest,
 position = 0

var statuslayer = L.esri.featureLayer({
    url: data
}).addTo(map);

// use esri leaflet query to return counts of counties for each category 
var statusQuery = L.esri.query({
    url: data
});

function decode(d){
    return d == 0 ? 'Normal' :
        d == 1 ? 'Incipient' :
        d == 2 ? 'Moderate' :
        d == 3 ? 'Severe' :
        d == 4 ? 'Extreme':
    'No Status';
}

function getColor(d) {
    return d == 0 ? '#ebf4c3' :
        d == 1 ? '#fecc5c' :
        d == 2 ? '#fd8d3c' :
        d == 3 ? '#f03b20' :
        '#bd0026';
}


function getCount(c, f) {
    statusQuery.where(f + "='" + c + "'").count(function(error, count, response) {
        $("#" + decode(c)).text(count);
        $("#" + decode(c) + "-h > .graph").text("");
        for (var i = 0; i < count; i++) {
            $("#" + decode(c) + "-h > .graph").append("|");
        }
    });
}

function getStats(f) {
    for (var i = 0; i < 5; i++) {
        getCount(i.toString(), f);
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
        return '<span style="font-weight:bold">'+layer.feature.properties["CNTYNAME"]+'</span>:<br>' + decode(layer.feature.properties[f]);
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

function makeTable(l){
    $("#drought-table-body").empty();
    var tablequery = L.esri.query({url:data});
    tablequery.fields([l,"CNTYNAME"]).orderBy("CNTYNAME").returnGeometry(false);
    tablequery.run(function(error, fc, response){
        for (var i=0; i <=45; i++){
            var trow = "<tr><td>"+fc.features[i].properties["CNTYNAME"]+"</td><td id="+decode(fc.features[i].properties[l])+"-t>"+decode(fc.features[i].properties[l])+"</td></tr>"
            $("#drought-table-body").append(trow);
        }
        $("#table-date").text(prettydate(l));
    });
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
        makeTable(latest);
    });
}
//call to get data updated
getLatest();

$("#archive-select").change(function(){
    if (this.value == "current"){
        setLayer(latest);
        getStats(latest);
        makeTable(latest);
        $("#qualifier").text("Current");
        $("#date").text(prettydate(latest));
        $("#table-date").text(prettydate(latest));
        $("#forward").prop("disabled", true);
    } else {
        setLayer(this.value);
        getStats(this.value);
        makeTable(this.value);
        $("#qualifier").text("Archived");
        $("#date").text(prettydate(this.value));
        $("#table-date").text(prettydate(this.value));
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

var pdfParse = function(){
    var d = $("#date").text()
    return [d.substring(0,2), d.substring(3,5), d.substring(8)].join("")
}

$("#reportdl").on('click', function(){
    window.open("pdf/status-reports/Status"+pdfParse()+".pdf"); 
});


$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
});
