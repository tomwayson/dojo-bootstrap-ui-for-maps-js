define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/on',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'esri/map',
  'esri/dijit/Scalebar',
  'esri/layers/WebTiledLayer',
  'esri/dijit/LocateButton',
  'esri/dijit/Geocoder',

  'components/bootstrapmap/bootstrapmap',

  'dojo/text!./templates/Map.html'
], function(declare, array, on,
  _WidgetBase, _TemplatedMixin,
  Map, Scalebar, WebTiledLayer, LocateButton, Geocoder,
  BootstrapMap,
  template) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      this._initMap();
    },

    _initMap: function() {
      var _this = this;
      var webmap = this.config.portal.itemId;
      if (webmap) {
        // TODO: use map options from config
        // TODO: loading...
        BootstrapMap.createWebMap(webmap, this.mapNode, {
          slider: true,
          nav:false,
          smartNavigation:false
        }).then(function(response) {
          _this.map = response.map;

          // TODO: get other map info
          // Add titles
          // dom.byId('mapTitle').innerHTML = response.itemInfo.item.title;
          // //dom.byId('mapSubTitle').innerHTML = response.itemInfo.item.snippet;
          // // Add scalebar and legend
          // var layers = esri.arcgis.utils.getLegendLayers(response);
          if(_this.map.loaded){
            _this._initMapControls();
          } else {
            on(_this.map,'load',function(){
              _this._initMapControls();
            });
          }
      },function(error){
        alert('Sorry, could not load webmap!');
        console.log('Error loading webmap: ' + JSON.stringify(error));
      });
      } else {
        this.map = BootstrapMap.create(this.mapNode, this.config.map.options);
        this._initMapControls();
      }
    },

    _initMapControls: function() {
      this.scalebar = new Scalebar({
        map: this.map,
        scalebarUnit: 'dual'
      });
      this.geoLocate = new LocateButton({
        map: this.map,
        'class': 'locate-button'
      }, this.locateNode);
      this.geoLocate.startup();
      this.geocoder = new Geocoder({
        map: this.map,
        'class': 'geocoder'
      }, this.searchNode);
      this.geocoder.startup();
    },

    clearBaseMap: function(){
      var map = this.map;
      console.log('getBasemap(): ' + map.getBasemap() + ', basemapLayerIds: ' +  map.basemapLayerIds);
      if(map.basemapLayerIds.length > 0){
        array.forEach(map.basemapLayerIds, function(lid){
          map.removeLayer(map.getLayer(lid));
        });
        map.basemapLayerIds = [];
      }else{
        map.removeLayer(map.getLayer(map.layerIds[0]));
      }
    },

    setBasemap: function(basemapText) {
      var map = this.map;
      var l, options;
      this.clearBaseMap();
      switch (basemapText) {
        case 'Water Color':
         options = {
            id:'Water Color',
            copyright: 'stamen',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tile.stamen.com/watercolor/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;

        case 'MapBox Space':

          options = {
            id:'mapbox-space',
            copyright: 'MapBox',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/eleanor.ipncow29/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;

        case 'Pinterest':
          options = {
            id:'mapbox-pinterest',
            copyright: 'Pinterest/MapBox',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/pinterest.map-ho21rkos/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;
        case 'Streets':
          map.setBasemap('streets');
          break;
        case 'Imagery':
          map.setBasemap('hybrid');
          break;
        case 'National Geographic':
          map.setBasemap('national-geographic');
          break;
        case 'Topographic':
          map.setBasemap('topo');
          break;
        case 'Gray':
          map.setBasemap('gray');
          break;
        case 'Open Street Map':
          map.setBasemap('osm');
          break;
      }
    }
  });
});