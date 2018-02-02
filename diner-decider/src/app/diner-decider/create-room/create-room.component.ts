import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import {Router} from '@angular/router';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { LocationService } from '../../location.service';

declare const $: any;

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
  zip: number = null;

  constructor(private platformLocation: PlatformLocation, private _locationService: LocationService,
  	public afAuth: AngularFireAuth, public db: AngularFireDatabase, private router: Router) {
  	const user = afAuth.authState;
  	this.href = (platformLocation as any).location.origin;
  	user.subscribe(data => {
  		this.uid = data.uid;
  	});
  	_locationService.getPosition()
  		.then(position => {
  			this.lat = position['coords']['latitude'];
  			this.long = position['coords']['longitude'];
  		});
  }

  ngOnInit() {
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
  }

  createRoom() {
  	const itemRef = this.db.object('rooms');
  	if(this.roomPassword == null){
  		itemRef.update({ [this.roomId]: {
					owner: this.uid,
					lat: this.lat,
					long: this.long,
					hungerBucks: this.hungerBucks,
					radiusMeters: this.convertMilesToMeters(this.radius),
          inProgress: true
				}
			}).then(data => {
				this.router.navigate(['/diner-decider/room/' + this.roomId]);
			}, err => {
				this.roomAlreadyExists = true;
			});
  	}else{
  		itemRef.update({ [this.roomId]: {
	  			password: this.roomPassword,
					owner: this.uid,
					lat: this.lat,
					long: this.long,
					hungerBucks: this.hungerBucks,
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

  canCreateRoom() {
  	if(this.roomId !== '' && this.lat !== null && this.long !== null
  		&& this.hungerBucks !== null && this.radius !== null){
  		return true;
  	}else{
  		return false;
  	}
  }

  convertMilesToMeters(miles: number) {
  	let metersPerMile: number = 1609.344;
  	return miles * metersPerMile;
  }

  resetValidation() {
  	this.roomAlreadyExists = false;
  }
}
