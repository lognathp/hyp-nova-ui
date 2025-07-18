import { Component, DoCheck, EventEmitter, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
// import { WebSocketService } from '../../core/services/websocket.service';
import { CommonModule } from '@angular/common';
import { SplitFirstCommaPipe } from "../../core/pipes/split-first-comma.pipe";
import { Router } from '@angular/router';
import { LocationPickerComponent } from "../location-picker/location-picker.component";
@Component({
  selector: 'app-select-location',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SplitFirstCommaPipe,
    LocationPickerComponent
  ],
  templateUrl: './select-location.component.html',
  styleUrl: './select-location.component.scss'
})
export class SelectLocationComponent implements OnInit, DoCheck,OnDestroy {

  searchTerm: string = '';
  searchPlaceId: string = '';
  searchResults: { placeId: string, text: string }[] = [];

  restaurentId: any;
  partnerId: string = '';
  restaurentActive: boolean = true;
  locationEnabled: boolean = true;
  unServiceableValue: boolean = false;
  checkChangeBranch: boolean = false;
  partnerData: any;
  availableBranchData: any;

  editLocationValue: any;
  selectedLocation: any = {
    addressType: '',
    addressOne: '',
    addressTwo: "",
    landmark: '',
    city: "",
    state: "",
    country: "",
    pincode: '',
    location: {},
    formattedAddress: ""
  };

  @Output() selectedLocationEmit = new EventEmitter<any>(); 
  @Output() changedLocationEmit = new EventEmitter<any>(); 
  serviceableLocations: { text: string; isServiceable: boolean; }[] = [];

nearLocations: {
  distance?: number;  // Make distance optional
  text: string; 
  isServiceable: boolean; 
}[] = [];
isSearching: any;
restaurantDetails: any;
SUGGESTED_AREAS = [
  { name: 'Gachibowli Hyderabad', lat: 17.4401, lng: 78.3489 },
  { name: 'HITECCity Hyderabad', lat: 17.4474, lng: 78.3765 },
  { name: 'Madhapur Hyderabad', lat: 17.4488, lng: 78.3905 },
  { name: 'JubileeHills Hyderabad', lat: 17.4331, lng: 78.4127 },
  { name: 'Kondapur Hyderabad', lat: 17.4849, lng: 78.3898 },
  { name: 'Miyapur Hyderabad', lat: 17.4962, lng: 78.3572 },
  { name: 'Kukatpally Hyderabad', lat: 17.4943, lng: 78.3996 },
  { name: 'Gachibowli ORR Hyderabad', lat: 17.4189, lng: 78.3418 },
  { name: 'Nanakramguda Hyderabad', lat: 17.4139, lng: 78.3263 },
  { name: 'FinancialDistrict Hyderabad', lat: 17.4142, lng: 78.3565 }
];

  constructor(
    public apiService: ApiService,
    private router: Router,
    private ngZone: NgZone
    // private wsService: WebSocketService
  ) { }

  ngOnInit(): void {
    const vendorDetail: any = localStorage.getItem('vendorData');
    let vdata = JSON.parse(vendorDetail)
    // console.log(vdata,vendorDetail);
    let restId: any = localStorage.getItem("selectedRestId")
    this.restaurentId = parseInt(restId);
    this.partnerData = JSON.parse(vendorDetail);
    // console.log(this.partnerData);

    if (vdata != undefined) {
      this.partnerId = vdata?.id;
    }


    if (this.restaurentId != undefined && !isNaN(this.restaurentId) && vdata != null) {
      this.isLocationEnabled();
      this.getRestaurantDetails();
    }

  }

  ngDoCheck(): void {




    // this.wsSubscription = this.wsService.getRestaurantStatusUpdates().subscribe((webSocketResponse: any) => {
    //   this.restaurentActive = webSocketResponse.store_status == 0 ? false : true;
    // });
  }

  ngOnDestroy() {
    this.clearAll();
  }


  public isLocationEnabled() {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        // console.log(permissionStatus.state)
        if (permissionStatus.state === 'denied') {
          this.locationEnabled = false;
        }
      }).catch(error => {
        console.error('Error checking geolocation permission:', error);
      });
    }
  }

  public getRestaurantDetails(): void {
    this.apiService.getMethod(`/restaurant/${this.restaurentId}`).subscribe({
      next: (response) => {
        this.restaurantDetails = response.data[0];
        this.restaurentActive = response.data[0].active;
        localStorage.setItem('restaurantDetails', JSON.stringify(response.data[0]));
      },
      error: (error) => {
        if (error.status === 400 || error.status === 404) {
          this.unServiceable()
          console.error('Restaurant get request error:', error);
        }
        console.error('Error fetching restaurant Details:', error);
      }
    });
  }

  public search(event: any): void {
   
    this.searchTerm = (event.target as HTMLInputElement).value;
    if (this.searchTerm.length > 0) {
      this.fetchPlacePrediction().subscribe((results: any) => {
        this.searchResults = results;
        // console.log(this.searchResults);
      });
    }
    // this. ngOnInit();
  }

  public fetchPlacePrediction(): Observable<{ placeId: string, text: string }[]> {
    return this.apiService.getMethod(`/location/maps/predict?search=${this.searchTerm}`).pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(response => {
        const suggestions: any[] = response?.data?.[0]?.suggestions || [];
        const placeIdTextArray = suggestions.map(suggestion => {
          const placeId = suggestion.placePrediction.placeId;
          const text = suggestion.placePrediction.text.text;
          return { placeId, text };
        });
        return of(placeIdTextArray);
      })
    );
  }

  getSuggestedLocations() {
    return this.SUGGESTED_AREAS.slice(0, 5).map(area => ({
      name: area.name,
      lat: area.lat,
      lng: area.lng,
      isServiceable: true
    }));
  }

  // Add this method to handle suggested location selection
  selectSuggestedLocation(location: any): void {
    if (!location || !location.name) {
      console.error('Invalid location data provided:', location);
      return;
    }
  
    console.log('Selected location:', location);
    
    try {
      const selectedArea = this.SUGGESTED_AREAS.find(area => 
        area?.name?.toLowerCase() === location.name?.toLowerCase()
      );
    
      if (!selectedArea) {
        throw new Error('Selected area not found in suggested areas');
      }
  
      const locationData = {
        addressOne: selectedArea.name,
        formattedAddress: selectedArea.name,
        location: {
          type: 'Point',
          coordinates: [selectedArea.lng, selectedArea.lat],
          latitude: selectedArea.lat,
          longitude: selectedArea.lng
        },
        lat: selectedArea.lat,
        lng: selectedArea.lng
      };
  
      console.log('Emitting location data:', locationData);
      
      // Store in localStorage with error handling
      try {
        localStorage.setItem('selectedLocation', JSON.stringify(locationData));
      } catch (storageError) {
        console.error('Failed to save location to localStorage:', storageError);
        // Continue execution even if localStorage fails
      }
      
      // Emit the location data
      try {
        const locationEvent = { 
          selectedLocation: locationData,
          coordinates: {
            lat: selectedArea.lat,
            lng: selectedArea.lng
          }
        };
        
        this.selectedLocationEmit.emit(locationEvent);
        this.changedLocationEmit.emit(locationEvent);
      } catch (emitError) {
        console.error('Error emitting location events:', emitError);
        return;
      }
  
      // Update UI
      this.searchTerm = selectedArea.name;
      this.searchResults = [];
      this.editLocationValue = locationData.location;
  
    } catch (error) {
      console.error('Error in selectSuggestedLocation:', error);
    }
  }

// Update the selectResult method to handle suggested locations
public selectResult(result: { placeId: string, text: string, isSuggested?: boolean }): void {
  if (result.isSuggested) {
    this.selectSuggestedLocation({ name: result.text });
    console.log('Selected suggested location:', result.text);
    return;
  }

  // Original API-based selection logic
  this.searchPlaceId = result.placeId;
  if (this.restaurentActive == false) return;
  
  this.apiService.getMethod(`/location/maps/place/${this.partnerId}?placeId=${result.placeId}`).subscribe({
    next: (response: { data: any }) => {
      const locationData = response.data[0].address;
      locationData.formattedAddress = this.formatAddress(locationData);
      
      // Ensure coordinates are properly set
      if (locationData.location) {
        locationData.location.type = 'Point';
        locationData.location.coordinates = [
          locationData.location.longitude,
          locationData.location.latitude
        ];
      }
      
      localStorage.setItem('selectedLocation', JSON.stringify(locationData));
      
      if (response.data[0].restaurants.length == 1) {
        localStorage.setItem('selectedRestId', response.data[0].restaurants[0]);
      }
      
      localStorage.setItem("availableBranches", JSON.stringify(response.data[0].restaurants));
      
      // Emit with coordinates
      this.selectedLocationEmit.emit({ 
        selectedLocation: locationData,
        coordinates: {
          lat: locationData.location?.latitude,
          lng: locationData.location?.longitude
        }
      });
      
      this.changedLocationEmit.emit({ 
        selectedLocation: locationData,
        coordinates: {
          lat: locationData.location?.latitude,
          lng: locationData.location?.longitude
        }
      });
      
      this.searchTerm = '';
      this.searchResults = [];
      this.editLocationValue = locationData.location;
    },
    error: error => {
      this.unServiceable();
      this.searchResults = [];
      console.error('Error fetching location data:', error);
    }
  });
}

// Add this helper method to format the address
private formatAddress(locationData: any): string {
  let formatted = '';
  if (locationData.addressOne) formatted += locationData.addressOne + ', ';
  if (locationData.addressTwo) formatted += locationData.addressTwo + ', ';
  if (locationData.addressType) formatted += locationData.addressType + ', ';
  if (locationData.city) formatted += locationData.city + ', ';
  if (locationData.country) formatted += locationData.country + ', ';
  if (locationData.landmark) formatted += locationData.landmark + ', ';
  if (locationData.state) formatted += locationData.state;
  if (locationData.pincode) formatted += ' - ' + locationData.pincode + '. ';
  return formatted;
}

  getSelectedLocation(event: any): void {
    // console.log(event);
    Object.entries(event).forEach(([key, value]) => {
      this.selectedLocation[key] = value
      // console.log(key, value);
    });
    localStorage.setItem('selectedLocation', JSON.stringify(this.selectedLocation));
    this.editLocationValue = "";

    // this.selectedLocationEmit.emit({ selectedLocation: this.selectedLocation });
    this.searchTerm = '';
    this.ngZone.run(() => {
      // this.router.navigate(['/order']); 
      this.checkServiceable(event.location);
    });
    
    


    // console.log(this.selectedLocation);
    
    // this.enableMapEdit = fal;
    // this.selectedLocation = event;
    // this.markedLocation = event;
  }

  checkServiceable(location:any){


    this.apiService.getMethod(`/location/maps/place/${this.partnerId}?latitude=${location.latitude}&longitude=${location.longitude}`).subscribe({
      next: (response: { data: any }) => {
        // console.log(response.data[0]);

        const locationData = response.data[0].address;


        locationData.formattedAddress = '';
        if (Object(locationData).addressOne != null) locationData.formattedAddress += Object(locationData).addressOne + ', ';
        if (Object(locationData).addressTwo != null) locationData.formattedAddress += Object(locationData).addressTwo + ', ';
        if (Object(locationData).addressType != null) locationData.formattedAddress += Object(locationData).addressType + ', ';
        if (Object(locationData).city != null) locationData.formattedAddress += Object(locationData).city + ', ';
        if (Object(locationData).country != null) locationData.formattedAddress += Object(locationData).country + ', ';
        if (Object(locationData).landmark != null) locationData.formattedAddress += Object(locationData).landmark + ', ';
        if (Object(locationData).state != null) locationData.formattedAddress += Object(locationData).state;
        if (Object(locationData).pincode != null) locationData.formattedAddress += ' - ' + Object(locationData).pincode + '. ';

        // console.log(Object.values(locationData));

        // localStorage.setItem('selectedLocation', JSON.stringify(locationData));
        if (response.data[0].restaurants.length == 1) {
          localStorage.setItem('selectedRestId', response.data[0].restaurants[0]);
        }
        localStorage.setItem("availableBranches", JSON.stringify(response.data[0].restaurants));

        // this.closeSearchBar();
        // this.foodMenuComponent.closeDeliveryMode();
        // this.foodMenuComponent.loadAddress();
        this.selectedLocationEmit.emit({ selectedLocation: this.selectedLocation });
      
        this.changedLocationEmit.emit({ selectedLocation: locationData });

        this.router.navigate(['/order'], {
          state: {
            showOutletSelection: true,
            checkChangeBranch: true
          }
        });    

        // Reset searchTerm and searchResults
        this.searchTerm = '';
        this.searchResults = [];
        this.editLocationValue = locationData.location;

      },
      error: error => {
        this.unServiceable();
        this.searchResults = [];
        this.unServiceableValue = true;
        console.error('Error fetching location data:', error);
      }
    });
  }

  public getMyCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          console.log('Current location:', location);
          
          // Instead of directly checking serviceability, set the location as a marker
          this.editLocationValue = location;
          
          // Optionally, you can also update the selected location
          this.selectedLocation = {
            ...this.selectedLocation,
            location: location
          };
          
          // Emit the location change event if needed
          this.changedLocationEmit.emit({ selectedLocation: this.selectedLocation });
          this.selectedLocationEmit.emit({ selectedLocation: this.selectedLocation });

        },
        (error) => {
          console.error('Error getting current location:', error);
          this.unServiceable();
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.unServiceable();
    }
  }

  // Add this method to format the location display
  getLocationDisplay(restaurant: any): string {
    const parts = [];
    
    // Try to get area, locality, or landmark
    const locationPart = restaurant.area || restaurant.locality || restaurant.landmark || '';
    const city = restaurant.city || '';
    
    if (locationPart) parts.push(locationPart);
    if (city && city !== locationPart) parts.push(city);
    
    return parts.join(', ');
  }

  public unServiceable(): void {
    this.unServiceableValue = true;
  }

  public clearAll(){
    this.editLocationValue = "";
    this.searchTerm = '';
    this.searchResults = [];
  }
 
}
