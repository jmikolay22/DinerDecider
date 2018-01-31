import { Injectable } from '@angular/core';

@Injectable()
export class GlobalService {
  BASE_API_URL = 'http://explorer-backend.wearecodevision.com';

  LISTINGS_ENDPOINT = '/api/v1/listings';

  LISTING_ENDPOINT = '/api/v1/listings';
}
