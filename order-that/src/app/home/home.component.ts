import { Component, OnInit } from '@angular/core';
import { ZomatoService } from '../zomato.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	categories: any[];
	restaurants: any[];
	showLoading: boolean = true;
	showCategories: boolean = false;
	showRestaurants: boolean = false;
	colors: string[] = ['#f80c12','#ff6644','#feae2d','#69d025','#12bdb9','#4444dd','#442299'];

  constructor(private _zomatoService: ZomatoService) { }

  ngOnInit() {
  	this.getCategories();
  }

  getCategories() {
  	this._zomatoService.get('categories').subscribe(
  		data => { 
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
