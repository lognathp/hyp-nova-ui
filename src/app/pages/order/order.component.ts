import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { SelectLocationComponent } from "../../components/select-location/select-location.component";
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import moment from 'moment';
import { RemoveSpecialCharacterPipe } from "../../core/pipes/remove-special-character.pipe";

import { environment } from '../../../environments/environment'
import { DiscountPricePipe } from "../../core/pipes/discount-price.pipe";
import { TimeformatPipe } from "../../core/pipes/timeformat.pipe";
import { DisplayQuantityPipe } from "../../core/pipes/display-quantity.pipe";
import { VariationAddonComponent } from "../../components/variation-addon/variation-addon.component";
import { Router } from '@angular/router';


declare var bootstrap: any; // Bootstrap is using from assets

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    SelectLocationComponent,
    CommonModule,
    RemoveSpecialCharacterPipe,
    DiscountPricePipe,
    TimeformatPipe,
    DisplayQuantityPipe,
    VariationAddonComponent
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {

  flatDiscountpercentage: number = environment.flatDiscountpercentage;
  contactHyperapps: string = environment.contactHyperapps;

  offcanvasInstance: any;
  selectedLocationData: any;

  restaurentId: number | undefined;
  partnerData: any;
  partnerId: any;
  branchData: any | null;
  workingHours: any;
  restaurentActive: any;
  menuCategoryData: any;
  menuResponseFiltered: any;
  selectedCategoryIndex: number = 0;
  addItemQunatityIndex!: number;
  selectedItemWithAddon: {} | undefined;
  selectedItem: any;
  foodBasket: any = [];
  indexOfSameItemWithAddons: any;
  selectedCategory: any;
  seletedItemId: any = [];
  sameAddon: boolean = false;
  addonResponse: any = [];
  variationResponse: any = [];
  cartItemPrice: number = 0;
  availableBranchData: any;
  vendorData: any;
  openSelectBranch: boolean = false;

  constructor(
    public apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit():void {

    const selectedLocation = localStorage.getItem('selectedLocation');
    console.log('oreder-Componet-init', selectedLocation)
    if (!selectedLocation || selectedLocation == undefined) {
      this.router.navigate(['/home']);
    }
    this.LocationData();


    const vendorDetail: any = localStorage.getItem('vendorData');
    if (vendorDetail) {
      this.partnerData = JSON.parse(vendorDetail);
      let restId: any = localStorage.getItem("selectedRestId")
      this.restaurentId = parseInt(restId);
      console.log(this.partnerData, this.restaurentId);

    }
    const branchData: any = localStorage.getItem("availableBranches");
    this.availableBranchData = JSON.parse(branchData);
    
    console.log(this.restaurentId, this.partnerData?.restaurants?.length, this.availableBranchData?.length);
    
    if ((this.restaurentId == undefined || isNaN(this.restaurentId)) && this.partnerData?.restaurants?.length > 1 && this.availableBranchData.length > 0) {
      this.openSelectBranch = true;
      this.openOffcanvas('selectOutlet');
    } else {
      this.ngAfterViewInit();
    }
    


  }

  ngAfterViewInit(): void {
    if (this.restaurentId != undefined && !isNaN(this.restaurentId)) {

      if (!isNaN(this.restaurentId)) {
        this.checkWorkingHours();
        this.LocationData();

        const vendorDetail: any = localStorage.getItem('vendorData');
        this.vendorData = JSON.parse(vendorDetail)
        // console.log(vdata);
        this.partnerId = this.vendorData.id;
        if (this.vendorData.restaurantDetails != undefined) {
          this.vendorData.restaurantDetails.forEach((brdata: any) => {
            if (brdata.id == this.restaurentId) {
              this.branchData = brdata;

              console.log(this.branchData);

            }
          });

        }
        console.log(' this.workingHours', this.workingHours, this.restaurentId, this.branchData);
      }

      this.getFoodMenuCategoryApi();
      this.openSelectBranch  = false;
    }
    else {
      console.log(this.availableBranchData, this.partnerData.restaurantDetails,'multibranch');

    }

  }
  ngDoCheck() {
    // const offcanvasElement = document.getElementById('selectDeliveryLocation');
    // const offcanvasElement2 = document.getElementById('foodMenu');
    // if (offcanvasElement) {
    //   this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
    // }
    // if (typeof bootstrap !== 'undefined') {
    //   console.log('✅ Bootstrap is loaded');
    // } else {
    //   console.error('❌ Bootstrap is NOT loaded');
    // }

    const localstrfoodItem: any = localStorage.getItem("foodBasket");
    if (localstrfoodItem != null) {
      this.foodBasket = JSON.parse(localstrfoodItem);
      this.foodBasket.forEach((ele: any) => { this.seletedItemId.push(ele.item.id) });
      this.calculateCartPrice();
    }

  }

  /**
   * 
   * @param index Selected array index of the availableBranchData array
   */
  public selectBranch(index: number): void {
    console.log(index, this.partnerData);
    if (this.availableBranchData.includes(this.partnerData.restaurantDetails[index].id)) {
      // if (index == 99) {
      //   this.ShowBranch();
      // } else {
      localStorage.setItem('selectedRestId', this.partnerData.restaurantDetails[index].id);

      this.ngOnInit();
      this.cdr.detectChanges();
      // this.branchId.emit(this.vendorData.restaurantDetails[index].id);
      this.restaurentId = this.partnerData.restaurantDetails[index].id;
      this.branchData = this.partnerData.restaurantDetails[index];
      // this.branchName = this.vendorData.restaurantDetails[index].restaurantName;
      // this.branchContact = this.vendorData.restaurantDetails[index].contact;
      // this.supportContact = this.vendorData.restaurantDetails[index].supportContact;
      // }
    }

  }


  /**
   * Take selected location data from the local storage and display in header
   */
  public LocationData(): void {

    const selectedLocation = localStorage.getItem('selectedLocation');

    if (selectedLocation) {
      const locationData = JSON.parse(selectedLocation);
      this.selectedLocationData = locationData.formattedAddress;
    }
  }

  /**
   * Get selected location data from select location component
   * @param locationSelectedEvent : location data from Output emitter
   */
  public getSelectedLocation(locationSelectedEvent: any): void {
    console.log(locationSelectedEvent);
    this.closeOffcanvas('selectDeliveryLocation');

  }

  /**
   * Method to call menu category
   */
  public getFoodMenuCategoryApi(): void {
    this.closeOffcanvas('selectOutlet');
    this.apiService.getMethod("/menu/category?restaurantId=" + this.restaurentId).subscribe({
      next: (reponse) => {
        console.log('menucategoryResponse', reponse);

        this.menuCategoryData = reponse.data;
        // this.menuResponseFiltered = reponse.data;  //

        this.menuCategoryData = reponse.data.sort((a: any, b: any) => {
          if (parseInt(a.categoryRank) < parseInt(b.categoryRank)) return -1;
          if (parseInt(a.categoryRank) > parseInt(b.categoryRank)) return 1;
          return 0;
        });

        // this.menuResponseFiltered.forEach((obj: any) => {
        //   obj.allItems = obj.items;
        // });

        // console.log(this.menuResponseFiltered);
        this.selectCategory(this.menuCategoryData[0], 0);
        localStorage.setItem("menuCategoryData", JSON.stringify(this.menuCategoryData));
        // this.mainLoading = false;
        // this.sharedData.sendMenuData(this.menuResponse)

        // if (this.menuResponseFiltered.length > 0) {
        //   this.restaurentLoading = false;
        // }

        // setTimeout(() => {
        //     this.restaurentLoading = false;
        //   }, 2000);


      },
      error: (error) => { console.log(error); }

    });

  }

  /**
   * Method to check working hours of the restaurants
   */
  public checkWorkingHours(): void {
    // this.workingHours = this.sharedData.checkWorkingHours();
    // this.restaurentLoading = true;
    this.apiService.getMethod(`/restaurant/${this.restaurentId}`).subscribe({
      next: (response) => {
        localStorage.setItem('restaurantDetails', JSON.stringify(response.data[0]));


        const restaurantDetails: any = response.data[0];
        this.restaurentActive = restaurantDetails.active;
        const workingHoursData = restaurantDetails.deliveryHours;
        const format = 'H:mm';
        const currentTime = moment().format('H:mm');
        const fromTime1 = moment(workingHoursData[0].from, format);
        const fromTime = moment(workingHoursData[1].from, format);
        const toTime1 = moment(workingHoursData[0].to, format);
        const toTime = moment(workingHoursData[1].to, format);
        const now = moment(currentTime, format);
        if (now.isBetween(fromTime1, toTime1) || now.isBetween(fromTime, toTime)) {
          this.workingHours = true;
        } else {
          this.workingHours = false;
        }

      },
      error: (error) => { console.error('Error fetching restaurant Details:', error); }
    });
  }

  /**
     * To select the food category menu
     * @param selected : Data of selected menu category
     * @param index : Index of that respective selected array value
     */
  public selectCategory(selected: Object, index: number): void {
    console.log(selected, index);
    this.selectedCategory = JSON.parse(JSON.stringify(selected));
    this.selectedCategory.allItems = JSON.parse(JSON.stringify(this.selectedCategory.items));
    // this.followOnIndex = index;
    // this.initialIndex = index;

    // this.followOnCategory = [];
  }
  /**
     * To add item into foodBasket array on clicking Add button 
     * If there is no variation / Addon it will be added else it will call respective API
     * @param item : Selected Item value
     */
  public selectItem(item: any): void {

    console.log(item);
    this.addItemQunatityIndex = -1;
    this.selectedItemWithAddon = {};
    if (item.quantity == undefined) {
      item['quantity'] = 1;
    }
    this.selectedItem = item;
    if (item.addon.length == 0 && item.variation.length == 0) {
      this.getAddedItem({ action: "add" });
    }
    if (item.addon.length) {
      this.getAddonItems(item.id);
    }
    if (item.variation.length) {
      this.getVariations(item.id);
    }
  }

  /**
     * Method invoked after addon popup component emits value
     * @param event : Data from the add-on popup component
     */
  public getAddedItem(event: any) {
    // this.showAddonVariationDialig = false;
    this.closeOffcanvas('addOn');
    console.log('event', event, this.selectedItem);
    console.log(this.foodBasket, this.addItemQunatityIndex);
    // this.foodBasket
    if (event.action == "add") {
      if (this.indexOfSameItemWithAddons?.length > 0) {
        this.indexOfSameItemWithAddons.forEach((indexval: number) => {
          if ((this.sameAddonItems(event.addonVariation.addOnNames, event.addonVariation.VatiationAddOnName, this.foodBasket[indexval].addonVariation.addOnNames))) {
            this.addItemQunatityIndex = indexval;
          }
        });
      }
      // console.log('kdfkhj',event?.addonVariation.addOnNames,this.foodBasket[this.addItemQunatityIndex]?.addonVariation.addOnNames);



      if (this.addItemQunatityIndex >= 0 && (this.sameAddonItems(event?.addonVariation?.addOnNames, event?.addonVariation?.VatiationAddOnName, this.foodBasket[this.addItemQunatityIndex]?.addonVariation?.addOnNames))) {
        if (this.foodBasket[this.addItemQunatityIndex].addonVariation.varients.id == event?.addonVariation.varients.id) {
          this.addItemQuantity('');

        } else {
          const addItem = {
            categoryId: this.selectedCategory.id,
            item: this.selectedItem,
            addonVariation: event?.addonVariation
          }
          this.foodBasket.push(addItem);
        }

      } else {
        event.addonVariation?.quantity != undefined ? this.selectedItem.quantity = event.addonVariation.quantity : this.selectedItem.quantity = 1;
         
        const addItem = {
          categoryId: this.selectedCategory.id,
          item: this.selectedItem,
          addonVariation: event?.addonVariation
        }
        this.foodBasket.push(addItem);
      }

      this.seletedItemId.push(this.selectedItem.id);
      // this.calculateCartPrice();
      // console.log('this.seletedItemId', this.seletedItemId);


    }
    console.log(this.foodBasket);
    this.storefoodBasketData();

    this.addonResponse = [];
    this.variationResponse = [];
  }

  /**
      * Method to get the addon values with API 
      * @param itemId : item id 
      */
  public getAddonItems(itemId: any) {
    this.addonResponse = [];
    this.apiService.getMethod(`/item/${itemId}/addons`).subscribe({
      next: (reponse) => {
        this.addonResponse.push(reponse.data);
        this.openOffcanvas('addOn');
        // this.showAddonVariationDialig = true;
        console.log("addonResponse:", this.addonResponse);

      },
      error: (error) => { console.log(error) }
    });
  }

  /**
    * Method to get the variations values with API 
    * @param itemId : item id 
    */
  public getVariations(itemId: any) {
    this.variationResponse = [];
    this.apiService.getMethod(`/item/${itemId}/variations`).subscribe({
      next: (reponse) => {
        this.variationResponse = reponse.data;
        if (this.variationResponse.length == this.selectedItem.variation.length) {

          // Remove empty objects from `addonGroups`
          // const cleanedData = this.variationResponse.map((item:any) => ({
          //   ...item,
          //   addonGroups: item.addonGroups.filter((obj:any) => Object.keys(obj).length !== 0) // Remove empty objects
          // }));
          this.openOffcanvas('addOn');

          // this.showAddonVariationDialig = true; TriggerVariatonin popup
        }

        console.log("variationResponse:", this.variationResponse);

      },
      error: (error) => { console.log(error) }
    });
  }

  /**
     * Method to add qunatity of same item
     */
  public addItemQuantity(equivalent: string): void {
    console.log('add qnty method', this.foodBasket[this.addItemQunatityIndex], this.addItemQunatityIndex);
    if (equivalent == "same") {
      // this.Showfoodcart = true;
    }
    this.sameAddon = false;
    if (this.foodBasket[this.addItemQunatityIndex]) {
      this.foodBasket[this.addItemQunatityIndex].item.quantity += 1;
    }


    this.storefoodBasketData();
    this.calculateCartPrice();
  }
  /**
   * Method to reduce quantity of the item and remove from array if quantity is 1
   */
  public reduceItemQuantity(): void {
    this.sameAddon = false;
    console.log(this.seletedItemId, this.foodBasket[this.addItemQunatityIndex], this.addItemQunatityIndex);
    if (this.foodBasket[this.addItemQunatityIndex].item.quantity == 1) {
      this.seletedItemId = this.seletedItemId.filter((id: string) => id != this.foodBasket[this.addItemQunatityIndex].item.id);
      this.foodBasket.splice(this.addItemQunatityIndex, 1);

    } else {
      this.foodBasket[this.addItemQunatityIndex].item.quantity -= 1;
    }

    if (this.foodBasket.length == 0) {
      // this.Showfoodcart = false;
    }
    this.storefoodBasketData();
    this.calculateCartPrice();
  }
  /**
     * Method invoked on clicking + / - buttons on UI
     * @param opteditem : Selected item value 
     * @param index :Index of selected item from the foodBasket array value
     * @param operation : To add or reduce quantity of the item
     */
  public sameAddonConfirmation(opteditem: any, Itemindex: number, operation: string) {

    console.log('plusbtn', opteditem, Itemindex, operation, this.foodBasket);
    // console.log(this.foodBasket, this.cartItemPrice);
    this.indexOfSameItemWithAddons = [];

    if (opteditem.addon.length == 0 && opteditem.variation.length == 0) {
      this.foodBasket.forEach((itemEle: any, index: number) => {
        if (itemEle.item.id == opteditem.id) {
          this.addItemQunatityIndex = index;
        }
      });
    }
    if (operation == 'add') {
      this.foodBasket.forEach((itemEle: any, index: number) => {
        if (itemEle.item.id == opteditem.id) {
          if (opteditem.addon.length > 0 || opteditem.variation.length > 0) {
            this.indexOfSameItemWithAddons.push(index);
          } else {
            this.addItemQunatityIndex = index;
          }
        }
      });
      console.log(this.addItemQunatityIndex, Itemindex);

    }

    if (operation == 'reduce') {
      if (opteditem.addon.length > 0 || opteditem.variation.length > 0) {
        // this.Showfoodcart = true;
      } else {
        this.reduceItemQuantity();
      }
    } else if ((opteditem.addon.length > 0 || opteditem.variation.length > 0) && operation == 'add') {
      this.sameAddon = true;
      // this.Showfoodcart = false;
      this.selectedItemWithAddon = JSON.parse(JSON.stringify(opteditem));
    } else {
      this.addItemQuantity('');
    }

  }
  /**
    * To store food basket data in local storage so that on going back to menu-page data can be taken from local storage 
    */
  public storefoodBasketData(): void {
    localStorage.setItem("foodBasket", JSON.stringify(this.foodBasket));

    this.calculateCartPrice();
  }

  /**
   * To display sub-total price of items added
   */
  public calculateCartPrice(): void {

    this.cartItemPrice = 0;
    const tempFoodBasket = JSON.parse(JSON.stringify(this.foodBasket));
    tempFoodBasket.forEach((ele: any) => {
      console.log(ele);
      
      if (ele.item.quantity == undefined) {
        // Item price will be 0 if there is variation
        if (ele.addonVariation != undefined) {
          this.cartItemPrice = this.cartItemPrice + parseFloat(ele.addonVariation.varients.price);
        } else {
          this.cartItemPrice = this.cartItemPrice + parseFloat(ele.item.price);
        }
      } else {
        // Item price will be 0 if there is variation
        if (ele.addonVariation != undefined && ele.addonVariation?.varients != undefined) {
          this.cartItemPrice = this.cartItemPrice + (parseFloat(ele.addonVariation.varients.price) * parseInt(ele.item.quantity));
        } else {
          this.cartItemPrice = this.cartItemPrice + (parseFloat(ele.item.price) * parseInt(ele.item.quantity));
        }

      }
    });
    console.log(this.cartItemPrice);

  }
  /**
     * To Check the selected addon on add quantity is same or not
     * @param newItemAddon : Value of the selected addon 
     * @param existingItemAddon : Existing addon value of that item
     * @returns : Boolean value of true / false is added addon Item same or not
     */
  public sameAddonItems(newItemAddon: any, newItemVariationAddon: any, existingItemAddon: any): Boolean {
    console.log(newItemAddon, newItemVariationAddon, existingItemAddon);
    let newAddonTemp: any = [];
    if (newItemAddon.length > 0) {
      newAddonTemp = newAddonTemp;
    } else if (newItemVariationAddon.length > 0) {
      newAddonTemp = newItemVariationAddon;
    }
    // const sortedArray1 = newItemAddon.slice().sort();
    const sortedArray1 = newAddonTemp.slice().sort();
    const sortedArray2 = existingItemAddon.slice().sort();

    let is_equal: Boolean = (newAddonTemp.length == existingItemAddon.length) && sortedArray1.every((element: any, index: number) => {
      return element === sortedArray2[index];
    });

    return is_equal;
  }

  /**
   * Make page to scroll to selected category
   * @param sectionId 
   */
  public scrollToSection(sectionId: number): void {
    const offcanvasElement = document.getElementById('foodMenu');

    if (offcanvasElement) {
      this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
      console.log(this.offcanvasInstance);

    }

    const element = document.getElementById('section-' + sectionId);
    const headerHeight = document.getElementById('veg-nonveg-filter')?.clientHeight || 0;
    this.selectedCategoryIndex = sectionId;



    if (element) {
      const topPosition = element.offsetTop - headerHeight; // Adjust for header height
      window.scrollTo({
        top: topPosition,
        behavior: 'smooth', // Smooth scrolling
      });
    }
    this.closeOffcanvas('foodMenu');
  }

  /**
   * Method to close bootstrap canvas ans bottom slider
   */
  public closeOffcanvas(offcanvasId: string): void {
    // if (this.offcanvasInstance) {
    //   this.offcanvasInstance.hide(); // Close offcanvas
    // }
    const offcanvasElement = document.getElementById(offcanvasId);
    if (offcanvasElement) {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide(); // Hide the offcanvas dynamically
      }
    }
  }

  public showBranches(): void {
    this.openOffcanvas('selectOutlet');
  }

  public openOffcanvas(offcanvasId: string) {
    const offcanvasElement = document.getElementById(offcanvasId);
    if (offcanvasElement) {
      const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
      bsOffcanvas.show();
    }
  }

  /**
   * Method to navigate to cart page
   */
  public navigateCart(): void {
    this.router.navigate(['/cart']);
  }


}
