var Page = {
  createMapMarkers: function() {
    var map = new GMaps({
      div: '#map-markers',
      lat: 40.712784,
      lng: -74.005941
    });

    //sample markers, but you can pass actual marker data as function parameter
    map.addMarker({
      lat: 40.713784,
      lng: -74.004941,
      title: 'Lima',
      click: function(e){
        alert('You clicked in this marker!');
      }
    });
    map.addMarker({
      lat: 40.711784,
      lng: -74.006941,
      title: 'Marker with HTML content',
      infoWindow: {
        content: '<p>Marker with HTML content</p>'
      }
    });

  },
  createMapStreetView: function() {
    GMaps.createPanorama({
      el: '#map-street-view',
      lat: 40.712784,
      lng: -74.005941
    });
  },
  createMapCustom: function() {
    var map = new GMaps({
      div: '#map-custom',
      lat: 40.712784,
      lng: -74.005941,
      styles: [{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}]
    });
  },
  createMapOverlay: function() {
    var map = new GMaps({
      div: '#map-overlay',
      lat: 40.712784,
      lng: -74.005941
    });
    map.drawOverlay({
      lat: map.getCenter().lat(),
      lng: map.getCenter().lng(),
      content: '<div class="gmaps-overlay">We\'re here!<div class="arrow"></div></div>',
      verticalAlign: 'top',
      horizontalAlign: 'center'
    });
  },
  init:function() {
    this.createMapMarkers();
    this.createMapStreetView();
    this.createMapCustom();
    this.createMapOverlay();
  }
}
