$( document ).ready(function() {
    // Before map is being initialized.
    var mapsPlaceholder = [];

    L.Map.addInitHook(function () {
        mapsPlaceholder.push(this); // Use whatever global scope variable you like.
    });

    $('#geoloc').leafletLocationPicker({
        mapContainer: '#mapContainer',
        mayer : 'SAT',
        height : 300,
    });

    $('#addForm').on('shown.bs.collapse', function (e) {
        //setTimeout(function(){ mapsPlaceholder.pop().invalidateSize()}, 400);
        mapsPlaceholder.pop().invalidateSize();
    });
});