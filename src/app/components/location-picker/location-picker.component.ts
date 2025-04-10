import { Component, AfterViewInit, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class LocationPickerComponent implements OnInit, AfterViewInit, OnChanges {

  @Output() selectedLocation = new EventEmitter<any>();
  @Input() editLocationData: any;

  map!: google.maps.Map;
  centerPosition!: { lat: number; lng: number };
  address: string = '';
  conformLocation: boolean = false;
  editLocation: boolean = false;



  constructor(private googleMapsLoader: GoogleMapLoaderService) { }

  ngOnInit() {
    const selectedLocation: any = localStorage.getItem('selectedLocation');
    const tempLocationSelected = JSON.parse(selectedLocation);
    if (this.editLocationData != undefined) {
      this.centerPosition = {
        lat: this.editLocationData.latitude,
        lng: this.editLocationData.longitude
      }
    } else {
      this.centerPosition = {
        lat: tempLocationSelected.location.latitude,
        lng: tempLocationSelected.location.longitude
      }
    }


  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(this.conformLocation, this.editLocation);
    // if(this.editLocation){
    //   this.conformLocation = false;
    // }
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
      fullscreenControl: false
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
    let city = '';
    let state = '';
    let pincode = '';
    let country = ''

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.address = results[0].formatted_address;
        console.log(results[0]);
        for (const component of results[0].address_components) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }

        }
        // alert(`Current Address:\n${this.address}`);    this.centerPosition
        console.log('Address:', this.address);
        this.selectedLocation.emit(
          {
            address: results[0].address_components,
            formattedAddress: this.address,
            location: { latitude: this.centerPosition.lat, longitude: this.centerPosition.lng },
            city: city,
            state: state,
            pincode: pincode,
            country: country
          });
        this.conformLocation = true;
        this.editLocation = false;
      } else {
        // alert('Address not found');
        console.error('Geocoder failed:', status);
      }
    });
  }

}