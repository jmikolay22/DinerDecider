import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { ZomatoService } from '../../zomato.service';
import { LocationService } from '../../location.service';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {
	roomId: string;
	roomPassword: string;
	rooms: Observable<any>;
	uid: string;
	lat: number = null;
	long: number = null;
	hungerBucks: number = null;
	radius: number = null;
	roomAlreadyExists: boolean = false;

  constructor(private _locationService: LocationService, private _zomatoService: ZomatoService,
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
  }

  ngOnInit() {}

  createRoom() {
  	const itemRef = this.db.object('rooms');
  	if(this.roomPassword == null){
  		itemRef.update({ [this.roomId]: {
					owner: this.uid,
					lat: this.lat,
					long: this.long,
					hungerBucks: this.hungerBucks,
					radiusMeters: this.convertMilesToMeters(this.radius)
				}
			}).then(data => {
				this.router.navigate(['/picker/room/' + this.roomId]);
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
					radiusMeters: this.convertMilesToMeters(this.radius)
				}
			}).then(data => {
				this.router.navigate(['/picker/room/' + this.roomId]);
			}, err => {
				this.roomAlreadyExists = true;
			});
  	}
  }

  canCreateRoom() {
  	if(this.roomId !== null && this.lat !== null && this.long !== null
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
