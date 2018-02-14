import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocationService } from './location.service';

declare const google: any;
declare const InfoBox: any;
declare const MarkerClusterer: any;
declare const $: any;
declare const RichMarker: any;

@Injectable()
export class MarkerService {

	public restaurants: BehaviorSubject<Array<Object>> = new BehaviorSubject<Array<Object>>([]);
	public markers: any[] = [];
  public map: any;
  public bound: any;
  public zoom: number = 13;
  public lat: number = 39.0972;
  public long: number = -84.5069
  public getNextPage: any;
  public showMore: boolean = false;
  private markerClusterer: any = null;
  public doneLoading: boolean = false;
  public isLocationDisabled: boolean = false;

  constructor(private _locationService: LocationService) {
  	this.map = new google.maps.Map(document.getElementById('map-object'), {
      zoom: this.zoom,
      scrollwheel: true,
      mapTypeControl: false,
      streetViewControl: true,
      zoomControl: false,
      minZoom: 10,
      center: { lat: this.lat, lng: this.long },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}]
    });

    this.setLocation();
  }

  public setLocation() {
    this._locationService.getPosition()
      .then(position => {
        this.lat = position['coords']['latitude'];
        this.long = position['coords']['longitude'];
        this.map.setCenter({ lat: this.lat, lng: this.long });
        var marker = new google.maps.Marker({
          clickable: false,
          icon: new google.maps.MarkerImage('assets/img/ic_my_location.png',
            new google.maps.Size(18,18),
            new google.maps.Point(0,0),
            new google.maps.Point(0,0)),
          shadow: null,
          zIndex: 999,
          map: this.map
        });

        marker.setPosition(new google.maps.LatLng(this.lat, this.long));
        this.isLocationDisabled = false;
      }).catch(error => {
        // Location is disabled.
        this.isLocationDisabled = true;
      });
  }

  public setPosition(lat, long) {
    this.lat = lat;
    this.long = long;
    this.map.setCenter({ lat: this.lat, lng: this.long });
  }

  public findRestaurants(lat, long, radius): void {
  	var queryObject = {
  		lat: lat,
  		long: long,
  		radius: radius
  	}
  	this.getRestaurants(queryObject)
  }

  public clearMarkers() {
  	this.restaurants.next([]);
  	for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    };
		this.markers = new Array();
		if (this.markerClusterer !== null){
			this.markerClusterer.clearMarkers();
		}
  }

  public clearRestaurants() {
  	this.restaurants.next([]);
  }

  public addMarker(id: string, hungerBucks: number) {
    var service = new google.maps.places.PlacesService(this.map);
    service.getDetails({
      placeId: id
    }, (place, status) => {
    	if (status === google.maps.places.PlacesServiceStatus.OK) {
    		const component = this;
  			component.bound = new google.maps.LatLngBounds();

  			const markerContent =
	        '<div class="marker">' +
	        '<p class="text-white marker-text"><b>' + place.name + ' (' + hungerBucks + ')</b></p>' +
	        '</div>';

    		const marker = new RichMarker({
		      id: place.id,
		      data: 'Im data',
		      flat: true,
		      position: place.geometry.location,
		      map: this.map,
		      shadow: 1,
		      content: markerContent
		    });

		    marker.addListener('click', () => {
	        component.map.setCenter(marker.getPosition());
	      });

	      this.markers.push(marker);
	      component.bound.extend(marker.getPosition());
   
    		if (this.markerClusterer === null) {
    			this.markerClusterer = new MarkerClusterer(this.map, this.markers, {
	    			styles: [
				      {
				        url: 'assets/img/cluster.png',
				        height: 36,
				        width: 36
				      }
				    ],
				    gridSize: 50,
				    zoomOnClick: true,
				    averageCenter: true,
				    minimumClusterSize: 2
				  });
    		} else {
    			this.markerClusterer.addMarker(marker);
    		}
    		
	    }
    });
  }

  private getRestaurants(query: Object) {
  	this.doneLoading = false;
    var service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch({
      keyword: 'restaurant',
      location: {lat: query['lat'] , lng: query['long']},
      radius: query['radius'],
      type: ['restaurant'],
      minPriceLevel: query['minPriceLevel'],
      mmaxPriceLevel: query['maxPriceLevel'],
      openNow: query['openNow']
    }, (restaurants, status, pagination) => {
    	if (status === google.maps.places.PlacesServiceStatus.OK) {
    		const component = this;
  			component.bound = new google.maps.LatLngBounds();

  			if (!this.showMore) {
  				this.clearMarkers();
  			}

  			var newRestaurantArray = this.restaurants.getValue();
  			var newMarkers = [];
  			for (var i = 0; i < restaurants.length; i++ ) {
    			const markerContent =
		        '<div class="marker">' +
		        '<p class="text-white marker-text"><b>' + restaurants[i].name + '</b></p>' +
		        '</div>';

      		const marker = new RichMarker({
			      id: restaurants[i].id,
			      data: 'Im data',
			      flat: true,
			      position: restaurants[i].geometry.location,
			      map: this.map,
			      shadow: 1,
			      content: markerContent
			    });

			    this.markers.push(marker);
			    newMarkers.push(marker);

			    marker.addListener('click', () => {
		        component.map.setCenter(marker.getPosition());
		      });
  
		      component.bound.extend(marker.getPosition());
		    	newRestaurantArray.push(restaurants[i]);
		    }

    		if (this.markerClusterer === null) {
    			this.markerClusterer = new MarkerClusterer(this.map, this.markers, {
	    			styles: [
				      {
				        url: 'assets/img/cluster.png',
				        height: 36,
				        width: 36
				      }
				    ],
				    gridSize: 50,
				    zoomOnClick: true,
				    averageCenter: true,
				    minimumClusterSize: 2
				  });
    		} else {
    			this.markerClusterer.addMarkers(newMarkers);
    		}
    		
    		this.showMore = pagination.hasNextPage;
        this.getNextPage = pagination.hasNextPage && function() {
          pagination.nextPage();
        };

        if ( this.showMore ) {
        	this.restaurants.next(newRestaurantArray);
        	this.getNextPage();
        } else {
        	this.doneLoading = true;
        	this.restaurants.next(newRestaurantArray);
        }   
	    } else {
	    	this.doneLoading = true;
	    	this.restaurants.next([]);
	    }
    });
  }
}
