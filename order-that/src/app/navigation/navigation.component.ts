import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate, keyframes, query, stagger, state } from '@angular/animations';

import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  animations: [
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
