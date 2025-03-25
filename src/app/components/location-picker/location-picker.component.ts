import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss'
})
export class LocationPickerComponent {
 
  apiKey = 'AIzaSyDJtFMqXk-R-SBEoP2U9I0ISIWSImLjM_U'; // API Key
  center: google.maps.LatLngLiteral = { lat: 17.448583499999998, lng: 78.39080349999999 }; // Default Location
  zoom = 10;
  markerPosition: google.maps.LatLngLiteral | any;
  selectedLocation: any;

  mapOptions: google.maps.MapOptions = {
    center: { lat: 17.448583499999998, lng: 78.39080349999999 },
    zoom: 15,
  };
  address: any;

  constructor() {}

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.getAddress(this.markerPosition.lat, this.markerPosition.lng);
    }
  }

  async getAddress(lat: number, lng: number) {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
    );
    const data = await response.json();
    if (data.results.length > 0) {
      this.address = data.results[0].formatted_address;
    } else {
      this.address = 'Address not found';
    }
  }

  detectUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.markerPosition = this.center;
        this.getAddress(this.center.lat, this.center.lng);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
}
