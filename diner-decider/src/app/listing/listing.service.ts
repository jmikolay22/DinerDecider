import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { GlobalService } from '../global.service';

import 'rxjs/Rx';

@Injectable()
export class ListingService {
  constructor(private globalService: GlobalService, private http: Http) {}

  getListings() {
    return this.http.get(this.globalService.BASE_API_URL + this.globalService.LISTINGS_ENDPOINT).map(res => res.json());
  }

  getListing(listing_id) {
    return this.http.get(this.globalService.BASE_API_URL + this.globalService.LISTING_ENDPOINT + '/' + listing_id).map(res => res.json());
  }
}
