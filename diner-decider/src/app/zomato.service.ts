import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { MarkerService } from './marker.service';

const httpOptions = {
  headers: new HttpHeaders({
  	'Content-Type': 'application/json',
  	'user-key': '34a10bf317c48b4f782635c73ca5d405'
  })
};

@Injectable()
export class ZomatoService {
	colors: string[] = ['#f80c12','#ff6644','#feae2d','#69d025','#12bdb9','#4444dd','#442299'];

  constructor(private _markerService: MarkerService, private http:HttpClient) {}
 
    // Uses http.get() to load data from a single API endpoint
    get(type: string): Observable<object> {
      return this.http.get('https://developers.zomato.com/api/v2.1/' + type, httpOptions);
    }

    search(query: Array<Object>) {
    	var url = 'https://developers.zomato.com/api/v2.1/search';
      var startParamFound = false;
      var startIndex = null;
    	for (var i = 0; i < query.length; i++) {
    		if (i !== 0) {
    			url += '&' + query[i]['id'] + '=' + query[i]['value'];
    		} else {
	    		url += '?' + query[i]['id'] + '=' + query[i]['value'];
	    	}
      }
      return this.http.get(url, httpOptions);
  }
}
