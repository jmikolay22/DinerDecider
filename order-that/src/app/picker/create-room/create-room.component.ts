import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {
	roomId: string;
	roomPassword: string;
	roomPasswordRequired: false;
	rooms: Observable<any>;
	uid: string;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase, private router: Router) {
  	const user = afAuth.authState;
  	user.subscribe(data => {
  		this.uid = data.uid;
  	});
  }

  ngOnInit() {}

  createRoom() {
  	const itemRef = this.db.object('rooms');
		itemRef.update({ [this.roomId]: {
				password: this.roomPassword,
				owner: this.uid
			} 
		});
		this.router.navigate(['/picker/room/' + this.roomId]);
  }

}
