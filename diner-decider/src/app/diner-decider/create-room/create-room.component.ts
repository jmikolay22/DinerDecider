import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { RestaurantsComponent } from '../../restaurants/restaurants.component';

import { LocationService } from '../../location.service';
import { MarkerService } from '../../marker.service';

declare const $: any;
declare const google: any;

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {
	roomId: string = '';
	roomPassword: string;
	rooms: Observable<any>;
	uid: string;
	lat: number = null;
	long: number = null;
	hungerBucks: number = 10;
  hungerBucksSlider: any;
  radiusSlider: any;
	radius: number = 5;
	roomAlreadyExists: boolean = false;
	href: string = null;
  zipCode: string = null;
  roomLink: string = null;
  showZip: boolean = false;
  showCurrentLocation: boolean = false;
  minPrice: number = 1;
  maxPrice: number = 4;
  category: string = "";
  showRoomDetails: boolean = true;
  showRoomOptions: boolean = false;
  showRestaurants: boolean = false;
  showLoading: boolean = true;
  restaurants: any[] = [];
  restaurantTotal: number = 0;

  constructor(public _markerService: MarkerService, private _locationService: LocationService,
  	public afAuth: AngularFireAuth, public db: AngularFireDatabase, private router: Router) {
  	const user = afAuth.authState;
  	user.subscribe(data => {
  		this.uid = data.uid;
  	});
  	_locationService.getPosition()
  		.then(position => {
  			this.lat = position['coords']['latitude'];
  			this.long = position['coords']['longitude'];
  		});
    _markerService.clearMarkers();

    this._markerService.restaurants.subscribe(
      value => {
        if ( this._markerService.doneLoading === true) {
          this.restaurants = value;
          this.restaurantTotal = value.length;
          this.showLoading = false;
        }
      }
    )  
  }

  ngOnInit() {
    $('.preview-restaurants-list').TrackpadScrollEmulator();

    this.hungerBucksSlider = $('#hunger-bucks-slider').slider({
      value: 10,
      min: 1,
      max: 20,
      ticks_tooltip: true
    });
    let self = this;
    $('#hunger-bucks-slider').slider().on('slideStart', function(ev){
        $('#hunger-bucks-slider').slider().data('slider').getValue();
    });

    $('#hunger-bucks-slider').slider().on('slideStop', function(ev){
        var newVal = $('#hunger-bucks-slider').slider().data('slider').getValue();
        if(self.hungerBucks != newVal) {
          self.hungerBucks = newVal;
        }
    });

    this.radiusSlider = $('#radius-slider').slider({
      value: 5,
      min: 1,
      max: 15,
      ticks_tooltip: true
    });

    $('#radius-slider').slider().on('slideStart', function(ev){
        $('#radius-slider').slider().data('slider').getValue();
    });

    $('#radius-slider').slider().on('slideStop', function(ev){
        var newVal = $('#radius-slider').slider().data('slider').getValue();
        if(self.radius != newVal) {
          self.radius = newVal;
        }
    });

    $(document).ready(function() {
      $("#categories").select2();
    });  
  }

  private getZipLatLong() {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': this.zipCode }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var lat = results[0].geometry.location.lat();
        var long = results[0].geometry.location.lng();
        deferred.resolve(lat, long);
      } else {
        deferred.reject(status);
      }
    })

    return deferred.promise();
  }

  public createRoomWithZip() {
    var vm = this;
    this.getZipLatLong()
    .then(function(lat, long) {
      vm.lat = lat;
      vm.long = long;
      vm.submitRoom();
    }).catch(error => {
      console.log(error);
    });
  }

  public createRoom() {
    if (this.validateZip()) {
      this.createRoomWithZip();
    } else {
      this.submitRoom();
    }
  }

  public validateZip() {
    if (this.zipCode !== null) {
      if (this.isNumeric(this.zipCode)) {
        if (this.zipCode.length === 5) {
          return true;
        }
      }
    }
    return false;
  }

  private toggleZip() {
    this.showZip = !this.showZip;
  }

  private toggleCurrentLocation() {
    this.showCurrentLocation = !this.showCurrentLocation;
  }

  private isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
  }

  private submitRoom() {
    this._markerService.setPosition(this.lat, this.long);
  	const itemRef = this.db.object('rooms');
  	if(this.roomPassword == null){
  		itemRef.update({ [this.roomId.toLowerCase()]: {
					owner: this.uid,
					lat: this.lat,
					long: this.long,
          minPriceLevel: this.minPrice,
          maxPriceLevel: this.maxPrice,
					hungerBucks: this.hungerBucks,
          category: this.category,
					radiusMeters: this.convertMilesToMeters(this.radius),
          inProgress: true
				}
			}).then(data => {
				this.router.navigate(['/diner-decider/room/' + this.roomId]);
			}, err => {
				this.roomAlreadyExists = true;
			});
  	}else{
  		itemRef.update({ [this.roomId.toLowerCase()]: {
	  			password: this.roomPassword,
					owner: this.uid,
					lat: this.lat,
					long: this.long,
          minPriceLevel: this.minPrice,
          maxPriceLevel: this.maxPrice,
					hungerBucks: this.hungerBucks,
          category: this.category,
					radiusMeters: this.convertMilesToMeters(this.radius),
          inProgress: true
				}
			}).then(data => {
				this.router.navigate(['/diner-decider/room/' + this.roomId]);
			}, err => {
				this.roomAlreadyExists = true;
			});
  	}
  }

  public canCreateRoom() {
  	if(this.roomId !== '' && (this.validateZip() === true || (this.lat !== null && this.long !== null))
  		&& this.hungerBucks !== null && this.radius !== null){
  		return true;
  	}else{
  		return false;
  	}
  }

  public canPreviewRestaurants() {
    if(this.roomId !== '' && 
      ((this.showZip === true && this.validateZip()) || (this.showCurrentLocation === true && this.lat !== null && this.long !== null))
      && this.hungerBucks !== null && this.radius !== null){
      return true;
    }else{
      return false;
    }
  }

  public canContinue() {
    if(this.roomId !== ''){
      return true;
    }else{
      return false;
    }
  }

  public enableRoomOptions() {
    this._markerService.clearMarkers();
    this.showRoomDetails = false;
    this.showRestaurants = false;
    this.showRoomOptions = true;
  }

  public enableRoomDetails() {
    this.showRoomDetails = true;
    this.showRestaurants = false;
    this.showRoomOptions = false;
  }

  public enablePreviewRestaurants() {
    this.setCategories();
    this._markerService.clearMarkers();
    this.showLoading = true;
    let vm = this;
    if (this.validateZip()) {
      this.getZipLatLong()
      .then(function(lat, long) {
        vm.lat = lat;
        vm.long = long;
        vm._markerService.findRestaurants(
          vm.lat, vm.long, vm.convertMilesToMeters(vm.radius),
          vm.minPrice, vm.maxPrice, vm.category);
        vm.showRoomDetails = false;
        vm.showRestaurants = true;
        vm.showRoomOptions = false;
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.showRoomDetails = false;
      this.showRestaurants = true;
      this.showRoomOptions = false;
      this._markerService.findRestaurants(
        this.lat, this.long, this.convertMilesToMeters(this.radius),
        this.minPrice, this.maxPrice, this.category);
    }
    
  }

  private convertMilesToMeters(miles: number) {
  	let metersPerMile: number = 1609.344;
  	return miles * metersPerMile;
  }

  public resetValidation() {
    this.roomLink = this.href + '/DinerDecider/diner-decider/' + this.roomId.toLowerCase();
  	this.roomAlreadyExists = false;
  }

  private setCategories() {
    let categories: Array<Object> = $('#categories').select2('data');
    this.category = '';
    for (let i = 0; i < categories.length; i++) {
      // If "Any" is selected, clear category and stop
      if (categories[i]['id'] === "Any") {
        this.category = 'restaurant';
        return;
      } else {
        if (i === categories.length - 1) {
          this.category += '(' + categories[i]['id'] + ')';
        } else {
          this.category += '(' + categories[i]['id'] + ') OR ';
        }
      }
    }
  }
}
