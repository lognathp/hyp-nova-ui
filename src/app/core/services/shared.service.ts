import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private shardDataSubject = new BehaviorSubject<any>({});
  private sharedMenuData = new BehaviorSubject<any>({});
  private selectedAddress = new BehaviorSubject<any>({});
  private currentOrder = new BehaviorSubject<any>({});
  private showLoginFormSource = new BehaviorSubject<boolean>(false);
  showLoginForm$ = this.showLoginFormSource.asObservable();
  private restaurantDetails = new BehaviorSubject<any>({});
  private vendorDetails = new BehaviorSubject<any>({});
  private sharedDeliveryQuotedata = new BehaviorSubject<any>({});


sendBasketData(data:any){
  this.shardDataSubject.next(data);
}

getBasketData(){
  return this.shardDataSubject.asObservable();
}

sendMenuData(data:any){
  this.sharedMenuData.next(data);
}

getMenuData(){
  return this.sharedMenuData.asObservable();
}


sendDeliveryQuotedata(data:any){
  this.sharedDeliveryQuotedata.next(data);
}

getDeliveryQuotedata(){
return  this.sharedDeliveryQuotedata.asObservable();
}

SelecetdAddress(data:any){
  this.selectedAddress.next(data);
}
getSelecetdAddress(){
  return this.selectedAddress.asObservable();
}

toggleLoginForm(): void {
  this.showLoginFormSource.next(!this.showLoginFormSource.value);
}

private vegFilter = new Subject<any>();

vegFilterFunction(data: any){
  this.vegFilter.next(data);
}
getvegFilterFunction(): Observable<any>{
  return this.vegFilter.asObservable();
}


private headerSearch = new Subject<any>();

headerSearchFunction(data: any){
  this.headerSearch.next(data);
}
getheaderSearchFunction(): Observable<any>{
  return this.headerSearch.asObservable();
}

sendcurrentOrderData(data:any){
  this.currentOrder.next(data);
}

getcurrentOrderData(){
  return this.currentOrder.asObservable();
}

sendRestaurantDetails(data:any){
  this.restaurantDetails.next(data);
}

getRestaurantDetails(){
  return this.restaurantDetails.asObservable();
}

sendbranchData(data:any){
  this.restaurantDetails.next(data);
}

getbranchData(){
  return this.restaurantDetails.asObservable();
}

checkWorkingHours(){
  const restaurantDetails:any = localStorage.getItem('restaurantDetails');
  const workingHoursData = JSON.parse(restaurantDetails).deliveryHours;
  const format = 'H:mm';
  const currentTime = moment().format('H:mm');

  for (const period of workingHoursData) {
    const fromTime = moment(period.from, format);
    const toTime = moment(period.to, format);
    const now = moment(currentTime, format);
    if (now.isBetween(fromTime, toTime, undefined, '[]')) {
      return true;
    }
  }
  return false;
}
  constructor() { }
}
