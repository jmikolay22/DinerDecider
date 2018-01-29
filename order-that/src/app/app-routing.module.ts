import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { PickerComponent } from './picker/picker.component';
import { CreateRoomComponent } from './picker/create-room/create-room.component';
import { RoomComponent } from './picker/room/room.component';

const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'picker', component: PickerComponent },
	{ path: 'picker/create-room',  component: CreateRoomComponent },
  { path: 'picker/room/:id',  component: RoomComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
