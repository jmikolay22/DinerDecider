import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
	user: Observable<firebase.User>;
	isActive: boolean = false;

  constructor(public afAuth: AngularFireAuth) {
  	this.user = afAuth.authState;
  }

  ngOnInit() {
  }

  logout() {
	  this.afAuth.auth.signOut();
	}
}
