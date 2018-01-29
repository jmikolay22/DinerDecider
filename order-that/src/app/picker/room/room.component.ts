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
	isValidRoom: boolean = false;
	needsPassword: boolean = true;
	invalidPasswordChecked: boolean = false;
	showLoading: boolean = true;
	showCategories: boolean = false;
	showRestaurants: boolean = false;
	room: Object;
	categories: any[];
	restaurants: any[];

  constructor(private _zomatoService: ZomatoService, public afAuth: AngularFireAuth, public db: AngularFireDatabase, private route: ActivatedRoute) { 
  	// Check if room exists
  	this.route.params.subscribe(params => {
      this.roomId = params['id'];
      const roomQuery = db.object('rooms/' + this.roomId).valueChanges();
	  	roomQuery.subscribe(data => {
	  		// If data is not null, we have found a valid room.
	  		if(data !== null){
	  			this.isValidRoom = true;
	  			this.room = data;
	  			this.hungerBucksRemaining = Object.assign(this.room['hungerBucks']);
	  		}else{
	  			//Room is invalid so we can stop here.
	  			return;
	  		}

	  		// Check if user is the owner of the room.
	  		const user = afAuth.authState;
		  	user.subscribe(data => {
		  		this.uid = data.uid;
		  		// If user is the room owner, don't require a password.
		  		if(this.room['owner'] === this.uid){
		  			this.needsPassword = false;
		  			this.getCategories();
		  		}
		  	});
	  	});
    });
  }

  ngOnInit() {
  }

  checkPassword() {
  	console.log(this.room);
  	console.log(this.password);
  	if(this.password === this.room['password']){
  		this.needsPassword = false;
  		this.invalidPasswordChecked = false;
  		this.getCategories();
  	}else{
  		this.invalidPasswordChecked = true;
  	}
  }

  resetValidation() {
  	this.invalidPasswordChecked = false;
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
  	console.log(i);
  	this._zomatoService.search([{'category': i}]).subscribe(	
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

}
