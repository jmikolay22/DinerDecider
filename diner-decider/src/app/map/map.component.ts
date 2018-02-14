import { Component, EventEmitter, Output, Input } from '@angular/core';
import { MarkerService } from '../marker.service';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: []
})

export class MapComponent {
  map: any;

  constructor(private _markerService: MarkerService) {
    this.map = _markerService.map;
  }

  setLocation() {
    this._markerService.setLocation();
  }

  actionZoomIn() {
    this.map.setZoom(this.map.getZoom() + 1);
  }

  actionZoomOut() {
    this.map.setZoom(this.map.getZoom() - 1);
  }

  actionType(type: string) {
    if (type === 'HYBRID') {
      this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    } else if (type === 'SATELLITE') {
      this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    } else if (type === 'TERRAIN') {
      this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    } else if (type === 'ROADMAP') {
      this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
  }
}
