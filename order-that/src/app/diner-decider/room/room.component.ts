import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, transition, animate, keyframes, query, stagger, state } from '@angular/animations';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { ZomatoService } from '../../zomato.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),

        query(':enter', stagger('50ms', [
          animate('.6s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: true}),

        query(':leave', stagger('10ms', [
          animate('.6s ease-out', keyframes([
            style({opacity: 1, transform: 'translateY(0)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 0, transform: 'translateY(-75%)',     offset: 1.0}),
          ]))]), {optional: true})
      ])
    ]),
    trigger('flyInOut', [
	    state('in', style({transform: 'translateX(0)'})),
	    transition('void => *', [
	      style({transform: 'translateX(-100%)'}),
	      animate(100)
	    ]),
	    transition('* => void', [
	      animate(100, style({transform: 'translateX(-100%)'}))
	    ])
	  ]),
	  trigger('flyDownOut', [
	    state('in', style({transform: 'translateY(0)'})),
	    transition('void => *', [
	      style({transform: 'translateY(-100%)'}),
	      animate(100)
	    ]),
	    transition('* => void', [
	      animate(100, style({transform: 'translateY(-100%)'}))
	    ])
	  ])
  ]
})
export class RoomComponent implements OnInit {
	hungerBucksRemaining: number;
	roomId: string;
	uid: string;
	password: string;
	needsPassword: boolean = false;
	invalidPasswordChecked: boolean = false;
	showLoading: boolean = true;
	showCategories: boolean = false;
	showRestaurants: boolean = false;
	showCart: boolean = false;
	firstTimePasswordChecked: boolean = true;
	showDifferentRoomButton: boolean = false;
	room: Object;
	categories: any[];
	restaurants: any[];
	orders: any[] = [];
	browseTitle: string = "Restaurant Categories";

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
  			if (data !== null) {
  				this.room = data;
	  			this.hungerBucksRemaining = Object.assign(this.room['hungerBucks']);
			  	this.needsPassword = false;
			  	this.getCategories();
  			} else {
  				if (this.firstTimePasswordChecked) {
	  			this.firstTimePasswordChecked = false;
	  		} else {
	  			this.invalidPasswordChecked = true;
	  			this.showDifferentRoomButton = true;
	  		}
	  		this.needsPassword = true;
  			}
	  	},
	  	err => {
	  		if (this.firstTimePasswordChecked) {
	  			this.firstTimePasswordChecked = false;
	  		} else {
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

  onCategoryClick(id: number) {
  	this.showCategories = false;
  	this.showLoading = true;

  	this._zomatoService.search([
  		{ id: 'category', value: id },
  		{ id: 'lat', value: this.room['lat'] },
  		{ id: 'lon', value: this.room['long'] },
  		{ id: 'radius', value: this.room['radiusMeters'] }
  	]).subscribe(	
  		data => { 
  			this.restaurants = data['restaurants'];
  			this.showRestaurants = true;
  			this.showLoading = false;
  			for (var i = 0; i < this.categories.length; i++) {
  				if (this.categories[i].categories.id === id) {
  					this.browseTitle = this.categories[i].categories.name;
  				}
  			}
  		},
  		err => console.log(err)
  	);
  }

  goBackToCategories() {
  	this.showCategories = true;
  	this.showRestaurants = false;
  	this.restaurants = [];
  	this.browseTitle = "Restaurant Categories";
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
		for (var i = 0; i < total; i++) {
			dollarSigns.push('$');
		}
		return dollarSigns;
	}

	spendHungerBuck(restaurant: Object) {
		if (this.hungerBucksRemaining === 0) {
			return;
		}

		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === restaurant['id']) {
				this.orders[i].balance++;
				this.hungerBucksRemaining--;
				return;
			}
		}

		this.orders.push({
			restaurantId: restaurant['id'],
			restaurant: restaurant,
			balance: 1
		})
		this.hungerBucksRemaining--;
	}

	refundHungerBuck(restaurant: Object) {
		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === restaurant['id']) {
				this.orders[i].balance--;
				this.hungerBucksRemaining++;
				if (this.orders[i].balance === 0) {
					this.orders.splice(i, 1);
				}
				return;
			}
		}

		return;
	}

	getRestaurantHungerBucksTotal(id: number) {
		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === id) {
				return this.orders[i].balance;
			}
		}
		return 0;
	}

	buildRating(rating) {
    rating = Math.round(rating);
    let template = '';

    for (let i = 1; i < rating; i++) {
      template += '<i class="fa fa-star"></i>';
    }

    for (let i = rating; i <= 5; i++) {
      template += '<i class="fa fa-star-o"></i>';
    }

    return template;
  }

  showCartDiv() {
  	this.showCart = true;
  	this.showCategories = false;
  	this.showRestaurants = false;
  }

  showBrowseDivs() {
  	this.showCart = false;
  	if (this.restaurants === undefined || this.restaurants.length === 0) {
  		this.showCategories = true;
  	} else {
  		this.showRestaurants = true;
  	}
  }
}
