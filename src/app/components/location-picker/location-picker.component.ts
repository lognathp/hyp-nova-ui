import { Component, AfterViewInit, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleMapLoaderService } from '../../core/services/google-map-loader.service'

declare const google: any;
@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss'
})
export class LocationPickerComponent implements OnInit, AfterViewInit {

  @Output() selectedLocation = new EventEmitter<any>();


  map!: google.maps.Map;
  centerPosition!: { lat: number; lng: number };
  address: string = '';



  constructor(private googleMapsLoader: GoogleMapLoaderService) { }

  ngOnInit(){
    const selectedLocation:any = localStorage.getItem('selectedLocation');
    const tempLocationSelected = JSON.parse(selectedLocation);
    
    this.centerPosition = {
      lat: tempLocationSelected.location.latitude, 
      lng: tempLocationSelected.location.longitude
    }
    
  }

  ngAfterViewInit() {
    // this.initMap();
    this.googleMapsLoader.loadGoogleMaps().then(() => {
      this.initMap();
    }).catch(error => {
      console.error('Google Maps loading error:', error);
    });
  }

  initMap() {

    // this.centerPosition = { lat: 12.9716, lng: 77.5946 };
    // this.centerPosition = { lat: 17.387140, lng: 78.491684 };
    const mapOptions = {
      center: this.centerPosition,
      zoom: 15,
      disableDefaultUI: false,
    };

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    this.map.addListener('idle', () => {
      const center: any = this.map.getCenter();
      this.centerPosition = { lat: center.lat(), lng: center.lng() };
    });
  }

  getPinLocation(): void {
    console.log('Current Pin Location:', this.centerPosition);
    this.getAddressFromLatLng(this.centerPosition.lat, this.centerPosition.lng);
  }
  getAddressFromLatLng(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.address = results[0].formatted_address;
        // alert(`Current Address:\n${this.address}`);
        console.log('Address:', this.address);
        this.selectedLocation.emit({formattedAddress : this.address, location: this.centerPosition });
      } else {
        // alert('Address not found');
        console.error('Geocoder failed:', status);
      }
    });
  }

}