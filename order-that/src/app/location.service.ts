import { Injectable } from '@angular/core';

@Injectable()
export class LocationService {
  constructor() {}

  getPosition() {
		return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
	}
}
