import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { ZomatoService } from '../../zomato.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
	hungerBucksRemaining: number;
	roomId: string;
	uid: string;
	password: string;
	needsPassword: boolean = true;
	invalidPasswordChecked: boolean = false;
	showLoading: boolean = true;
	showCategories: boolean = false;
	showRestaurants: boolean = false;
	firstTimePasswordChecked: boolean = true;
	showDifferentRoomButton: boolean = false;
	room: Object;
	categories: any[];
	restaurants: any[];

  constructor(private _zomatoService: ZomatoService, public afAuth: AngularFireAuth, public db: AngularFireDatabase, private route: ActivatedRoute) { 
  	const user = afAuth.authState;
  	user.subscribe(response => {
  		this.uid = response.uid;
  	});

  	// Check if user is authorized to enter room
  	this.checkIfUserHasRoomPermissions();
  }

  ngOnInit() {
  }

  checkIfUserHasRoomPermissions() {
  	this.route.params.subscribe(params => {
      this.roomId = params['id'];
      const roomQuery = this.db.object('rooms/' + this.roomId).valueChanges();
	  	roomQuery.subscribe(data => {
  			if(data !== null){
  				this.room = data;
	  			this.hungerBucksRemaining = Object.assign(this.room['hungerBucks']);
			  	this.needsPassword = false;
			  	this.getCategories();
  			}else{
  				if(this.firstTimePasswordChecked){
	  			this.firstTimePasswordChecked = false;
	  		}else{
	  			this.invalidPasswordChecked = true;
	  			this.showDifferentRoomButton = true;
	  		}
	  		this.needsPassword = true;
  			}
	  	},
	  	err => {
	  		if(this.firstTimePasswordChecked){
	  			this.firstTimePasswordChecked = false;
	  		}else{
	  			this.invalidPasswordChecked = true;
	  			this.showDifferentRoomButton = true;
	  		}
	  		this.needsPassword = true;
	  	});
    });
  }

  checkPassword() {
  	const itemRef = this.db.object('users/' + this.uid + '/rooms');
  	itemRef.update({ [this.roomId]: {
			password: this.password
		}});

  	this.checkIfUserHasRoomPermissions();
  }

  resetValidation() {
  	this.invalidPasswordChecked = false;
  	this.showDifferentRoomButton = false;
  }

  getCategories() {
  	this._zomatoService.get('categories').subscribe(
  		data => {
  			this.categories = data['categories'];
  			this.showCategories = true;
  			this.showLoading = false;
  		},
  		err => console.log(err)
  	);
  }

  onCategoryClick(i: number) {
  	this.showCategories = false;
  	this.showLoading = true;

  	this._zomatoService.search([
  		{ id: 'category', value: i },
  		{ id: 'lat', value: this.room['lat'] },
  		{ id: 'lon', value: this.room['long'] },
  		{ id: 'radius', value: this.room['radiusMeters'] }
  	]).subscribe(	
  		data => { 
  			this.restaurants = data['restaurants'];
  			this.showRestaurants = true;
  			this.showLoading = false;
  		},
  		err => console.log(err)
  	);
  }

  goBackToCategories() {
  	this.showCategories = true;
  	this.showRestaurants = false;
  }

  getDistance(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist.toFixed(2)
	}

	getDollarSigns(total: number) {
		var dollarSigns = [];
		for(var i = 0; i < total; i++) {
			dollarSigns.push('$');
		}
		return dollarSigns;
	}
}
