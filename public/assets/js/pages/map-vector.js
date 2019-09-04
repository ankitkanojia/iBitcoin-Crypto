var Page = {
    createWorldMap: function() {

      $('#world-map').vectorMap({
  			map : 'world_mill',
  			normalizeFunction : 'polynomial',
  			hoverOpacity : 0.7,
  			hoverColor : false,
  			regionStyle : {
  				initial : {
  					fill : '#57c5a5'
  				}
  			},
  			backgroundColor : 'transparent',
  		});

    },
    createAllMaps: function() {
      this.createMap('#africa-map', 'africa_mill');
      this.createMap('#asia-map', 'asia_mill');
      this.createMap('#europe-map', 'europe_mill');
      this.createMap('#north-america-map', 'north_america_mill');
      this.createMap('#oceania-map', 'oceania_mill');
      this.createMap('#south-america-map', 'south_america_mill');
      this.createMap('#usa-map', 'us_aea');
      this.createMap('#uk-map', 'uk_countries_mill');
      this.createMap('#china-map', 'cn_mill');
      this.createMap('#india-map', 'in_mill');
    },
    createMap: function(selector, map) {

      $(selector).vectorMap({
  			map : map,
  			backgroundColor : 'transparent',
  			regionStyle : {
  				initial : {
  					fill : '#57c5a5'
  				}
  			}
  		});

    },
    init:function() {
        this.createWorldMap();
        this.createAllMaps();
    }
}
