import { Component, OnInit } from '@angular/core';
import { trigger,style,transition,animate,keyframes,query,stagger } from '@angular/animations';

import { AngularFireDatabase, AngularFireList  } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { ZomatoService } from '../zomato.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('items', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),

        query(':enter', stagger('300ms', [
          animate('.6s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: true})
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
	categories: any[];
	restaurants: any[];
	showLoading: boolean = true;
	showCategories: boolean = false;
	showRestaurants: boolean = false;
	colors: string[] = ['#f80c12','#ff6644','#feae2d','#69d025','#12bdb9','#4444dd','#442299'];

	user: Observable<firebase.User>;

  constructor(public afAuth: AngularFireAuth, private _zomatoService: ZomatoService) { 
  	this.user = afAuth.authState;
  }

  ngOnInit() {
  	this.getCategories();
  }

  getCategories() {
  	this._zomatoService.get('categories').subscribe(
  		data => { 
  			console.log(data);
  			this.categories = data['categories'];
  			this.showCategories = true;
  			this.showLoading = false;
  		},
  		err => console.log(err),
  		() => console.log('Done')
  	);
  }

  getColorIndex(i: number) {
  	if(i >= this.colors.length){
  		return i % this.colors.length;
  	}else{
  		return i;
  	}
  }

  onCategoryClick(i: number) {
  	this.showCategories = false;
  	this.showLoading = true;
  	this._zomatoService.search([{'category': i}]).subscribe(	
  		data => { 
  			this.restaurants = data['restaurants'];
  			this.showRestaurants = true;
  			this.showLoading = false;
  		},
  		err => console.log(err),
  		() => console.log('Done')
  	);
  }
}
