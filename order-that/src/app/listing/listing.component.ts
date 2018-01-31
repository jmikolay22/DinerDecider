import {Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { ListingService } from './listing.service';
import { Listing } from './listing';

declare const $: any;

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css'],
  providers: [ListingService]
})

export class ListingComponent implements OnInit, OnChanges  {
  @Input() listings: Listing[] = [];
  @Input() listing_id: number;
  @Output() onListingChange = new EventEmitter<number>();

  compressed: boolean;
  user: Observable<firebase.User>;

  constructor( public afAuth: AngularFireAuth) {
    this.user = this.afAuth.authState;
  }

  ngOnInit() {
    $('.map-results-list').TrackpadScrollEmulator();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  toggleResults() {
    this.compressed ? this.compressed = false : this.compressed = true
  }

  changeListing(listing_id: number) {
    if (this.listing_id !== listing_id) {
      this.listing_id = listing_id;
      this.onListingChange.emit(listing_id);
    }
  }

  login() {
    this.afAuth.auth.signInAnonymously();
  }
}
