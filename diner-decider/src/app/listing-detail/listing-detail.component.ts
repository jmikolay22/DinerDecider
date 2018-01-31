import {Component, OnInit, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {trigger, state, style} from '@angular/animations';
import {Listing} from '../listing/listing';

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.css'],
  animations: [
    trigger('stateChanged', [
      state('closed', style({
        'z-index': '99',
        'transform': 'translateX(-100%)'
      })),
      state('open', style({
        'z-index': '99',
        'transform': 'translateX(0)'
      }))
    ])
  ]
})
export class ListingDetailComponent implements OnInit, OnChanges {
  @Input() listing_id: number;
  @Output() onListingChange = new EventEmitter<number>();

  state: string;
  listing: Listing;

  constructor() {
    this.state = 'closed';
  }

  ngOnInit() {
  }

  ngOnChanges(changes: any) {
  }

  close() {
    this.listing = null;
    this.state = 'closed';
    this.onListingChange.emit(null);
  }
}
