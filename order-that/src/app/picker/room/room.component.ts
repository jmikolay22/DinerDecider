import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
	roomId: string;
	uid: string;
	password: string;
	invalidRoom: boolean = true;
	needsPassword: boolean = true;
	invalidPasswordChecked: boolean = false;
	room: Object;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase, private route: ActivatedRoute) { 
  	// Check if room exists
  	this.route.params.subscribe(params => {
      this.roomId = params['id'];
      const roomQuery = db.object('rooms/' + this.roomId).valueChanges();
	  	roomQuery.subscribe(data => {
	  		// If data is not null, we have found a valid room.
	  		if(data !== null){
	  			this.invalidRoom = false;
	  			this.room = data;
	  		}

	  		// Check if user is the owner of the room.
	  		const user = afAuth.authState;
		  	user.subscribe(data => {
		  		this.uid = data.uid;
		  		// If user is the room owner, don't require a password.
		  		if(this.room['owner'] === this.uid){
		  			this.needsPassword = false;
		  		}
		  	});
	  	});
    });
  }

  ngOnInit() {
  }

  checkPassword(){
  	console.log(this.room);
  	console.log(this.password);
  	if(this.password === this.room['password']){
  		this.needsPassword = false;
  		this.invalidPasswordChecked = false;
  	}else{
  		this.invalidPasswordChecked = true;
  	}
  }

  resetValidation(){
  	this.invalidPasswordChecked = false;
  }

}
