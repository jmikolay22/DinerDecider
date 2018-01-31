import { Component, ChangeDetectorRef } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import {Listing} from './listing/listing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
	listings: Listing[] = [];
  listing_id: number;
  user: Observable<firebase.User>;

  title = 'app';

  constructor(private afAuth: AngularFireAuth, private cd: ChangeDetectorRef) {
    this.user = afAuth.authState;
  }

  setListing(listing_id: number) {
    this.listing_id = listing_id;
    this.cd.detectChanges();
  }

  logout() {
	  this.afAuth.auth.signOut();
	}
}
