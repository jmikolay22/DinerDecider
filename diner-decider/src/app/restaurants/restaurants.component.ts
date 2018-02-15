import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { trigger, style, transition, animate, keyframes, query, stagger, state } from '@angular/animations';

import { MarkerService } from '../marker.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss'],
  animations: [
    trigger('slide', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),

        query(':enter', stagger('50ms', [
          animate('.6s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: true}),

        query(':leave', stagger('10ms', [
          animate('.6s ease-out', keyframes([
            style({opacity: 1, transform: 'translateY(0)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
            style({opacity: 0, transform: 'translateY(-75%)',     offset: 1.0}),
          ]))]), {optional: true})
      ])
    ]),
    trigger('flyInOut', [
	    state('in', style({transform: 'translateX(0)'})),
	    transition('void => *', [
	      style({transform: 'translateX(-100%)'}),
	      animate(100)
	    ]),
	    transition('* => void', [
	      animate(100, style({transform: 'translateX(-100%)'}))
	    ])
	  ]),
	  trigger('flyDownOut', [
	    state('in', style({transform: 'translateY(0)'})),
	    transition('void => *', [
	      style({transform: 'translateY(-100%)'}),
	      animate(100)
	    ]),
	    transition('* => void', [
	      animate(100, style({transform: 'translateY(-100%)'}))
	    ])
	  ])
  ]
})

export class RestaurantsComponent implements OnInit {
	restaurantTotal: number = 0;

	@Input() restaurants: any[];

	@Input() hungerBucksRemaining: number;
	@Output() hungerBucksRemainingChange:EventEmitter<number> = new EventEmitter<number>();
	
	@Input() orders: any[] = [];
	@Output() ordersChange:EventEmitter<any[]> = new EventEmitter<any[]>();

	@Input() displayOrders: boolean = false;
	@Input() displaySpending: boolean = true;

  constructor() {
  	if (this.restaurants !== undefined) {
  		this.restaurantTotal = this.restaurants.length;
  	}
  }

  ngOnInit() {}

  getDollarSigns(total: number) {
		if ( total === undefined ) {
			return ['?'];
		}
		var dollarSigns = [];
		for (var i = 0; i < total; i++) {
			dollarSigns.push('$');
		}
		return dollarSigns;
	}

	buildRating(rating) {
    rating = Math.round(rating);
    let template = '';

    for (let i = 1; i <= rating; i++) {
      template += '<i class="fa fa-star"></i>';
    }

    for (let i = rating; i <= 5; i++) {
      template += '<i class="fa fa-star-o"></i>';
    }

    return template;
  }

	spendHungerBuck(restaurant: Object) {
		if (this.hungerBucksRemaining === 0) {
			return;
		}

		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === restaurant['place_id']) {
				this.orders[i].balance++;
				this.ordersChange.emit(this.orders);
				this.hungerBucksRemaining--;
				this.hungerBucksRemainingChange.emit(this.hungerBucksRemaining);
				return;
			}
		}

		this.orders.push({
			restaurantId: restaurant['place_id'],
			restaurant: restaurant,
			balance: 1
		})
		this.ordersChange.emit(this.orders);

		this.hungerBucksRemaining--;
		this.hungerBucksRemainingChange.emit(this.hungerBucksRemaining);
	}

	refundHungerBuck(restaurant: Object) {
		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === restaurant['place_id']) {
				this.orders[i].balance--;
				this.ordersChange.emit(this.orders);

				this.hungerBucksRemaining++;
				this.hungerBucksRemainingChange.emit(this.hungerBucksRemaining);

				if (this.orders[i].balance === 0) {
					this.orders.splice(i, 1);
					this.ordersChange.emit(this.orders);
				}
				return;
			}
		}

		return;
	}

	getRestaurantHungerBucksTotal(id: number) {
		for (var i = 0; i < this.orders.length; i++) {
			if (this.orders[i].restaurantId === id) {
				return this.orders[i].balance;
			}
		}
		return 0;
	}
}
