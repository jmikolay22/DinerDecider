import {Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { Listing } from './listing';

declare const $: any;

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css'],
  providers: []
})

export class ListingComponent implements OnInit  {

  compressed: boolean;
  user: Observable<firebase.User>;
  message: string = null;

  constructor( public afAuth: AngularFireAuth) {
    this.user = this.afAuth.authState;
  }

  ngOnInit() {
    //$('.map-results-list').TrackpadScrollEmulator();
  }

  toggleResults() {
    this.compressed ? this.compressed = false : this.compressed = true
  }

  anonymousLogin() {
    this.afAuth.auth.signInAnonymously();
  }

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    this.socialSignIn(provider);
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider()
    this.socialSignIn(provider);
  }

  private socialSignIn(provider) {
    this.afAuth.auth.signInWithPopup(provider)
      .then((credential) =>  {
        this.message = null;
      })
      .catch(error => {
        this.message = error.message;
      });
  }
}
