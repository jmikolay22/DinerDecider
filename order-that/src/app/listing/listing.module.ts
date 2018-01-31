import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingComponent } from './listing.component';
import { ListingDetailComponent } from '../listing-detail/listing-detail.component';;
import { ListingService } from "./listing.service";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ListingComponent,
    ListingDetailComponent
  ],
  providers: [
    ListingService
  ],
  exports: [
    ListingComponent,
    ListingDetailComponent
  ]
})
export class ListingModule { }
