import { Component, OnInit, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, transition, animate, keyframes, query, stagger, state } from '@angular/animations';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { MarkerService } from '../../marker.service';

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
	showRestaurants: boolean = false;
	showCart: boolean = false;
	firstTimePasswordChecked: boolean = true;
	submittedCart: boolean = false;
	firstRestaurantLoad: boolean = true;
	showCards: boolean = false;
	displayName: string;
	room: Object;
	restaurants: any[];
	restaurantTotal: number = 0;
	orders: any[] = [];
	results: Object = {};
	card1: Object = {};
	card2: Object = {};

  constructor(private _markerService: MarkerService, public afAuth: AngularFireAuth, public db: AngularFireDatabase, private route: ActivatedRoute) { 
  	const user = afAuth.authState;
  	user.subscribe(response => {
  		this.uid = response.uid;
  		this.displayName = response.displayName;
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
			  	for (var key in this.room['submissions']) {
			  		if (key === this.uid) {
			  			this.submittedCart = true;
			  			break;
			  		}
			  	}
			  	if (this.firstRestaurantLoad && this.submittedCart === false) {
			  		this.updateRestaurants();
			  		this._markerService.clearMarkers();
			  		this._markerService.clearRestaurants();
			  		this.showRestaurants = true;
			  		this._markerService.restaurants.subscribe(
				      value => {
				      	if ( value !== undefined && value.length !== 0) {
					        this.restaurants = value;
					        if (this._markerService.doneLoading === true) {
					        	this.restaurantTotal = value.length;
						        this.showLoading = false;
					        }

				  				this.firstRestaurantLoad = false;
				  			}
				      }
				    )	
			  	}
			  	if (this.firstRestaurantLoad && this.room['inProgress'] === false) {
			  		this.showResults();
			  	}
  			} else {
  				if (this.firstTimePasswordChecked) {
	  			this.firstTimePasswordChecked = false;
	  		} else {
	  			this.invalidPasswordChecked = true;
	  		}
	  		this.needsPassword = true;
  			}
	  	},
	  	err => {
	  		if (this.firstTimePasswordChecked) {
	  			this.firstTimePasswordChecked = false;
	  		} else {
	  			this.invalidPasswordChecked = true;
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
  }

  updateRestaurants() {
  	this._markerService.findRestaurants(
  		this.room['lat'], this.room['long'], this.room['radiusMeters']);
  }

  getNextPage() {
  	this._markerService.getNextPage();
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
		if ( total === undefined ) {
			return ['?'];
		}
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
			if (this.orders[i].restaurantId === restaurant['place_id']) {
				this.orders[i].balance++;
				this.hungerBucksRemaining--;
				return;
			}
		}

		this.orders.push({
			restaurantId: restaurant['place_id'],
			restaurant: restaurant,
			balance: 1
		})
		this.hungerBucksRemaining--;
	}

	refundHungerBuck(restaurant: Object) {
		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === restaurant['place_id']) {
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

    for (let i = 1; i <= rating; i++) {
      template += '<i class="fa fa-star"></i>';
    }

    for (let i = rating; i <= 5; i++) {
      template += '<i class="fa fa-star-o"></i>';
    }

    return template;
  }

  showCartDiv() {
  	this.showCart = true;
  	this.showRestaurants = false;
  }

  showBrowseDivs() {
  	this.showCart = false;
  	this.showRestaurants = true;
  }

  submitCart() {
  	var cartSubmission = {};
  	for (var i = 0; i < this.orders.length; i++) {
  		var order = this.orders[i];
  		delete order.restaurant.geometry;
  		delete order.restaurant.photos;
  		cartSubmission[order.restaurantId] = {
  			balance: order.balance,
  			restaurant: order.restaurant,
  			displayName: this.displayName
  		}
  	}
  	const itemRef = this.db.object('rooms/' + this.roomId + '/submissions');
		itemRef.update({ [this.uid]: cartSubmission })
		.then(data => {
			this.submittedCart = true;
			this.showCart = false;
			this.showRestaurants = false;
		}, err => {
			console.log('error', err);
		});
  }

  showResults() {
  	const itemRef = this.db.object('rooms/' + this.roomId);
		itemRef.update({ ['inProgress']: false })
		.then(data => {
			this._markerService.clearMarkers();
			for (var submission in this.room['submissions']) {
				for (var restaurant in this.room['submissions'][submission]) {
					this.updateResults(this.room['submissions'][submission][restaurant]);
				}
			}
			for (var key in this.results) {
				this._markerService.addMarker(this.results[key]['restaurant']['place_id'], this.results[key]['balance']);
			}
		}, err => {
			console.log('error', err);
		});
  }

  updateResults(restaurant: Object) {
  	if (Object.keys(this.results).length === 0 || this.results[restaurant['restaurant']['place_id']] === undefined) {
  		this.results[restaurant['restaurant']['place_id']] = restaurant;
  	} else {
  		var newBalance = this.results[restaurant['restaurant']['place_id']].balance + restaurant['balance'];
  		restaurant['balance'] = newBalance;
  		this.results[restaurant['restaurant']['place_id']] = restaurant;
  	}
  	this.results = Object.assign({}, this.results);
  }

  getDisplayNameFromSubmission(submission: Object) {
  	var firstItem = submission['value'][Object.keys(submission['value'])[0]];
  	return firstItem.displayName;
  }

  flip() {
  	for (var result in this.results) {
  		this.card1['name'] = this.results[result]['restaurant'].name;
  		this.card2['name'] = this.results[result]['restaurant'].name;
  	}
  	this.showCards = true;
  	document.getElementById("#flipper").classList.toggle("flip");
  }
}
