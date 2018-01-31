import { Component, ChangeDetectorRef } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import {ListingService} from './listing/listing.service';
import {Listing} from './listing/listing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
	user: Observable<firebase.User>;
	listings: Listing[] = [];
  listing_id: number;

  title = 'app';

  constructor(private cd: ChangeDetectorRef, listingService: ListingService, public afAuth: AngularFireAuth) {
    this.user = this.afAuth.authState;
    const listing$ = listingService.getListings();
    
    listing$.subscribe(
      listings => this.listings = listings
    );
  }

  setListing(listing_id: number) {
    this.listing_id = listing_id;
    this.cd.detectChanges();
  }
}
