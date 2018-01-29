import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(public db: AngularFireDatabase, private router: Router) { }

  ngOnInit() {
  }

  enableJoinRoom() {
  	this.showJoinRoom = true;
  }

  joinRoom() {
  	const room = this.db.object('rooms/' + this.roomId).valueChanges();
  	room.subscribe(data => {
  		if(data !== null){
	  		console.log(data);
	  		this.router.navigate(['picker/room/' + this.roomId]);
	  	}else{
	  		this.isValidRoom = false;
	  	}
  	});
  }

  cancel() {
  	this.showJoinRoom = false;
  	this.roomId = '';
  }

}
