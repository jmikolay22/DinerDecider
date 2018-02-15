import { Component, OnInit, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, transition, animate, keyframes, query, stagger, state } from '@angular/animations';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { RestaurantsComponent } from '../../restaurants/restaurants.component';

import { MarkerService } from '../../marker.service';

declare const $: any;

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
	inProgress: boolean = true;
	invalidPasswordChecked: boolean = false;
	showLoading: boolean = true;
	showRestaurants: boolean = false;
	showCart: boolean = false;
	firstTimePasswordChecked: boolean = true;
	submittedCart: boolean = false;
	firstRestaurantLoad: boolean = true;
	showFlip: boolean = false;
	showCards: boolean = false;
	resultsLoaded: boolean = false;
	displayName: string;
	room: Object;
	restaurants: any[];
	orderRestaurants: any[];
	restaurantTotal: number = 0;
	orders: any[] = [];
	checkedResults: string[] = [];
	results: Object = {};
	card1: Object = {};
	card2: Object = {};
	flipClass: string = 'flip-container flip1';

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
  	$('.restaurants-list').TrackpadScrollEmulator();
  }

  showShareModal() {
  	$('#shareModal').modal('show');
  	// Todo: Fix this link so its dynamic based on where the page is hosted.
  	$('#roomName').val('https://cincyelite22.github.io/DinerDecider/diner-decider/room/' + this.roomId);
  	if (this.room['password'] === undefined) {
  		$('#roomPasswordContainer').hide();
  	} else {
  		$('#roomPasswordContainer').show();
  		$('#roomPassword').val(this.room['password']);
  	}
  }

  checkIfUserHasRoomPermissions() {
  	this.route.params.subscribe(params => {
      this.roomId = params['id'].toLowerCase();
      const roomQuery = this.db.object('rooms/' + this.roomId).valueChanges();
	  	roomQuery.subscribe(data => {
  			if (data !== null) {
  				this.room = data;
  				this.inProgress = this.room['inProgress'];
			  	this.needsPassword = false;
			  	for (var key in this.room['submissions']) {
			  		if (key === this.uid) {
			  			this.submittedCart = true;
			  			break;
			  		}
			  	}
			  	if (this.firstRestaurantLoad && this.submittedCart === false && this.inProgress === true) {
			  		this.hungerBucksRemaining = Object.assign(this.room['hungerBucks']);
			  		this.updateRestaurants();
			  		this._markerService.clearMarkers();
			  		this._markerService.clearRestaurants();
			  		this._markerService.setPosition(this.room['lat'], this.room['long']);
			  		this.showRestaurants = true;
			  		this._markerService.restaurants.subscribe(
				      value => {
				      	if ( this._markerService.doneLoading === true) {
					        this.restaurants = value;
					        this.restaurantTotal = value.length;
						      this.showLoading = false;
				  				this.firstRestaurantLoad = false;
				  			}
				      }
				    )	
			  	}
			  	if (this.inProgress === false) {
			  		this.showResults(false);
			  		this.showLoading = false;
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
  		this.room['lat'], this.room['long'], this.room['radiusMeters'],
  		this.room['minPriceLevel'], this.room['maxPriceLevel'], this.room['category']);
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
  		var id = this.displayName
  		if (this.displayName === null) {
  			id = this.uid;
  		}
  		cartSubmission[order.restaurantId] = {
  			balance: order.balance,
  			restaurant: order.restaurant,
  			displayName: id
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

  showResults(updateInProgress: boolean) {
  	if (updateInProgress) {
  		const itemRef = this.db.object('rooms/' + this.roomId);
			itemRef.update({ ['inProgress']: false })
			.then(data => {
				this.inProgress = false;
			}, err => {
				console.log('error', err);
			});
  	} else {
  		if (this.resultsLoaded === false) {
  			this.calculateResults();
  			this.submittedCart = true;
  		}
  	}	
  }

  calculateResults() {
  	this._markerService.clearMarkers();
		for (var submission in this.room['submissions']) {
			for (var restaurant in this.room['submissions'][submission]) {
				this.updateResults(this.room['submissions'][submission][restaurant]);
			}
		}
		for (var key in this.results) {
			this._markerService.addMarker(this.results[key]['restaurant']['place_id'], this.results[key]['balance']);
		}
		this.resultsLoaded = true;
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
  	if (this.showFlip === false) {
  		for (var key in this.results) {
	  		if (key === this.checkedResults[0]) {
	  			this.card1 = this.results[key]
	  		} else if (key === this.checkedResults[1]) {
	  			this.card2 = this.results[key];
	  		}
	  	}
  		this.showFlip = true;
  		this.showCards = true;
  		return;
  	} else {
  		var x = Math.floor(Math.random()*(1-0+1)+0);
	    if (x === 0) {
	    	if (this.flipClass === "flip-container flip1") {
	    		this.flipClass = "flip-container";
	    	} else {
	    		this.flipClass = 'flip-container flip1';
	    	}
	    } else {
	      if (this.flipClass === "flip-container flip1") {
	    		this.flipClass = "flip-container";
	    	} else {
	    		this.flipClass = 'flip-container flip1';
	    	}
	    }
  	}
  }

  RotateIt(deg){
	  $('#flipper').stop().animate({deg: deg}, {
	      step: function(now,fx) {
	        $(this).css('-webkit-transform','rotate('+now+'deg)'); 
	        $(this).css('-moz-transform','rotate('+now+'deg)');
	        $(this).css('transform','rotate('+now+'deg)');
	      },
	      duration:'slow'
	  },'linear');
	}

	ResetRotate(){
	  $('#flipper').stop().animate({deg: 0}, {
	      step: function(now,fx) {
	        $(this).css('-webkit-transform','rotate('+now+'deg)'); 
	        $(this).css('-moz-transform','rotate('+now+'deg)');
	        $(this).css('transform','rotate('+now+'deg)');
	      },
	      duration:'slow'
	  },'linear');
	}

  goBackToCards() {
  	this.showFlip = false;
  	this.showCards = false;
  }

  isFlipReady() {
  	if (this.checkedResults !== undefined && this.checkedResults.length === 2) {
  		return true;
  	} else {
  		return false;
  	}
  }

  isChecked(place_id: string) {
  	for (var i = 0; i < this.checkedResults.length; i++) {
  		if (this.checkedResults[i] === place_id) {
  			return true;
  		}
  	}
  	return false;
  }

  toggleChecked(place_id: string) {
  	for (var i = 0; i < this.checkedResults.length; i++) {
  		if (this.checkedResults[i] === place_id) {
  			this.checkedResults.splice(i, 1);
  			return;
  		}
  	}
  	this.checkedResults.push(place_id);
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
}
