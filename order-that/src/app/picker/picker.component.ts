import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss']
})
export class PickerComponent implements OnInit {
	showJoinRoom: boolean = false;
	isValidRoom: boolean = true;
	roomId: string = null;
	password: string = null;
	needsPassword: boolean = false;
	uid: string = null;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase, private router: Router) {
		const user = afAuth.authState;
  	user.subscribe(data => {
  		this.uid = data.uid;
  	});
  }

  ngOnInit() {
  }

  enableJoinRoom() {
  	this.showJoinRoom = true;
  }

  joinRoom() {
  	const room = this.db.object('rooms/' + this.roomId).valueChanges();
  	room.subscribe(success => {
	  	this.router.navigate(['picker/room/' + this.roomId]);
  	},
  	err => {
  		if(this.password !== null){
  			this.addRoomPasswordToUser();
  		}
  		this.needsPassword = true;
	  	this.isValidRoom = false;
  	});
  }

  cancel() {
  	this.showJoinRoom = false;
  	this.roomId = '';
  	this.isValidRoom = true;
  }

  resetValidation() {
  	this.isValidRoom = true;
  }

  addRoomPasswordToUser() {
  	const itemRef = this.db.object('users/' + this.uid + '/rooms');
  	itemRef.update({ [this.roomId]: {
			password: this.password
		}});
  }

}
