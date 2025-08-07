import { Component, OnInit, ChangeDetectorRef, NgZone, HostListener, ElementRef, DoCheck, Renderer2 } from '@angular/core';
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
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchFilterPipe } from "../../core/pipes/search-filter.pipe";
import { VegNonvegFilterPipe } from "../../core/pipes/veg-nonveg-filter.pipe";
import { BranchChangeComponent } from "../../components/alert-box/branch-change/branch-change.component";
import { WebSocketService } from '../../core/services/websocket.service';
import { interval, Subscription } from 'rxjs';
import { SplitFirstCommaPipe } from "../../core/pipes/split-first-comma.pipe";
import { MenuLoaderComponent } from "../../components/loaders/menu-loader/menu-loader.component";
import { FeedbackComponent } from "../../shared/feedback/feedback.component";


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
    VariationAddonComponent,
    FormsModule,
    SearchFilterPipe,
    VegNonvegFilterPipe,
    RouterLink,
    RouterModule,
    BranchChangeComponent,
    SplitFirstCommaPipe,
    MenuLoaderComponent,
    FeedbackComponent
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, DoCheck {

  // flatDiscountpercentage: number = environment.flatDiscountpercentage;
  flatDiscountpercentage: any;
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
  searchKeyword: string = "";
  itemFilterType: string = "";
  checkChangeBranch: boolean = false;

  private wsSubscription!: Subscription;
  customerDetails: any;
  showTracking: boolean = false;
  addOnBackdrop: boolean = false;
  private orderUpdateSubscription!: Subscription;
  liveOrders: any[] = []; // To store live orders
  liveOrderId: number[] = [];
  showLiveOrderId: boolean = false;
  showLiveOrders: boolean = false; // To control visibility of live orders panel
  orderPollingSubscription!: Subscription;


  loading = true;
  serviceable: any;
  weatherAlert: string | null = null;
  customerMessage: string | null = "Our delivery partner will call if they have trouble reaching you. Please keep your phone handy.";
  restaurentDetails: any;
  menuLoading: any;
  restaurentName: string = "";
  outletData: any;


  constructor(
    public apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private wsService: WebSocketService,
    private ngZone: NgZone,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
   // Initialize polling when component is created
  //  this.startOrderPolling();
  }

    // Add these new methods
    // private startOrderPolling(): void {
    //   // Initial fetch
    //   // this.fetchOrders();
      
    //   // Subscribe to WebSocket for order updates
    //   this.orderPollingSubscription = this.wsService.getOrderStatusUpdates().subscribe((message: any) => {
    //     if (message && this.customerDetails?.id) {
    //       // When we receive a WebSocket message, fetch fresh orders
    //     }
    //   });
    // }
  
    // private stopOrderPolling(): void {
    //   if (this.orderPollingSubscription) {
    //     this.orderPollingSubscription.unsubscribe();
    //   }
    // }

  ngOnInit(): void {
    this.loading = true;

    const selectedLocation = localStorage.getItem('selectedLocation');

    // console.log('oreder-Componet-init', selectedLocation)
    if (!selectedLocation || selectedLocation == undefined) {
      this.router.navigate(['/home']);
    }
    this.LocationData();


    const vendorDetail: any = localStorage.getItem('vendorData');
    if (vendorDetail) {
      const parsedData = JSON.parse(vendorDetail);
      if (parsedData?.restaurantDetails) {
        // First sort all restaurants by distance
        parsedData.restaurantDetails = this.sortRestaurantsByDistance(parsedData.restaurantDetails);
        
        // Get available branches from localStorage
        const branchData: any = localStorage.getItem("availableBranches");
        this.availableBranchData = JSON.parse(branchData) || [];
        // console.log("Available branch IDs:", this.availableBranchData);
        
        // Filter restaurantDetails to only include available branches
        this.outletData = parsedData.restaurantDetails.filter((restaurant: any) => 
          this.availableBranchData.includes(restaurant.id.toString())
        );
        
        console.log("Filtered outletData:", this.outletData);
      }
      this.partnerData = parsedData;
      let restId: any = localStorage.getItem("selectedRestId");
      this.restaurentId = restId ? parseInt(restId) : undefined;
    }
    const branchData: any = localStorage.getItem("availableBranches");
    this.availableBranchData = JSON.parse(branchData);

    const custDetail: any = localStorage.getItem('customerDetails');
    this.customerDetails = JSON.parse(custDetail);

    if (this.customerDetails != undefined) {
      this.getOrderHistory();
    }

    if ((this.restaurentId == undefined || isNaN(this.restaurentId)) && this.partnerData?.restaurants?.length > 1 && this.availableBranchData.length > 0) {
      this.openSelectBranch = true;
      this.openOffcanvas('selectOutlet');
    } else {
      this.ngAfterViewInit();
    }

    const branchJson = localStorage.getItem("currentBranch");
      try {
        const parsed = branchJson ? JSON.parse(branchJson) : null;

        if (parsed) {
          
          this.branchData = parsed;
                    
          const percentage = parsed.discountPercentage;

          this.flatDiscountpercentage = typeof percentage === 'number'
            ? percentage
            : (percentage !== undefined ? Number(percentage) : 0);
        } else {
          this.flatDiscountpercentage = 0;
        }
      } catch (e) {
        console.error("Failed to parse currentBranch from localStorage", e);
        this.flatDiscountpercentage = 0;
      }


        // Update the branch selection logic in ngOnInit
    const shouldShowBranchSelection = () => {
      // If we have a valid restaurant ID, no need to show branch selection
      if (this.restaurentId && !isNaN(Number(this.restaurentId))) {
        return false;
      }
      
      // Check if we have multiple branches available
      const hasMultipleBranches = this.partnerData?.restaurants?.length > 1;
      const hasAvailableBranches = this.availableBranchData?.length > 0;
      
      return hasMultipleBranches && hasAvailableBranches;
    };

    if (shouldShowBranchSelection()) {
      this.openSelectBranch = true;
      // Use setTimeout to ensure the view is fully initialized
      setTimeout(() => {
        this.openOffcanvas('selectOutlet');
      });
    } else {
      this.ngAfterViewInit();
    }

    

    this.wsSubscription = this.wsService.getRestaurantStatusUpdates().subscribe((webSocketResponse: any) => {
      this.restaurentActive = webSocketResponse.store_status == 0 ? false : true;
      // this.restaurentActive = false;
    });

    this.wsSubscription = this.wsService.getItemStatusUpdates().subscribe((webSocketResponse: any) => {
      this.updateItemStock(webSocketResponse);
    });

    this.wsSubscription = this.wsService.getRestaurentDetails().subscribe((webSocketResponse: any) => {
      console.log("restaurentDetails onInit", webSocketResponse);
      this.restaurentDetails = webSocketResponse;
      this.restaurentActive = webSocketResponse.active;
      this.serviceable = webSocketResponse.serviceable;
      // localStorage.setItem('restaurantDetails', JSON.stringify(webSocketResponse));
    });

    this.fetchOrders();

  }

  ngAfterViewInit(): void {
    this.loading = false;
    this.getFoodMenuCategoryApi();
    if (this.restaurentId != undefined && !isNaN(this.restaurentId)) {

      if (!isNaN(this.restaurentId)) {
        this.checkWorkingHours();
        this.LocationData();

        this.restaurentDetails = localStorage.getItem('restaurantDetails');
        const vendorDetail: any = localStorage.getItem('vendorData');
        this.vendorData = JSON.parse(vendorDetail)
        // console.log(vdata);
        this.partnerId = this.vendorData.id;
        if (this.vendorData.restaurantDetails != undefined) {
          this.vendorData.restaurantDetails.forEach((brdata: any) => {
            if (brdata.id == this.restaurentId) {
              this.branchData = brdata;
              this.restaurentName = this.branchData.restaurantName;
              localStorage.setItem('currentBranch',JSON.stringify(this.branchData) )
              // console.log(this.branchData);

            }
          });

        }
        // console.log(' this.workingHours', this.workingHours, this.restaurentId, this.branchData);
      }

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        document.body.style.overflow = 'auto'; // ensure scroll is enabled
      }, 0);

      this.openSelectBranch = false;

    }
    else {
      console.log(this.availableBranchData, this.partnerData.restaurantDetails, 'multibranch');

    }
  }


  ngDoCheck() {
    this.loading = false;
    this.wsSubscription = this.wsService.getRestaurantStatusUpdates().subscribe((webSocketResponse: any) => {
      console.log("restaurentActive ngDoCheck", webSocketResponse);
      this.restaurentActive = webSocketResponse.store_status == 0 ? false : true;
      // this.restaurentActive = false;
    });

    this.wsSubscription = this.wsService.getItemStatusUpdates().subscribe((webSocketResponse: any) => {
      this.updateItemStock(webSocketResponse);
    });

    this.wsSubscription = this.wsService.getRestaurentDetails().subscribe((webSocketResponse: any) => {
      console.log("restaurentDetails ngDoCheck", webSocketResponse);
      this.restaurentDetails = webSocketResponse;
      this.serviceable = webSocketResponse.serviceable;
      this.restaurentActive = webSocketResponse.active;
      console.log("restaurentDetails ngDoCheck", this.restaurentDetails);
    });

    const localstrfoodItem: any = localStorage.getItem("foodBasket");
    if (localstrfoodItem != null) {
      this.foodBasket = JSON.parse(localstrfoodItem);
      this.foodBasket.forEach((ele: any) => { this.seletedItemId.push(ele.item.id) });
      this.calculateCartPrice();
    }
    
    this.orderUpdateSubscription = this.wsService.getOrderStatusUpdates().subscribe((orderUpdate: any) => {
      if (orderUpdate.customerId === this.customerDetails.id) {
      this.ngZone.run(() => {
        // Update the live orders list
        this.updateLiveOrders([orderUpdate]);
        this.cdr.detectChanges();
      });
    }});
    // this.checkWorkingHours();
  }

  /**
   * 
   * @param index Selected array index of the availableBranchData array
   */
  public selectBranch(index: number): void {
    if (!this.outletData || index >= this.outletData.length) {
      console.error('Invalid branch selection index:', index);
      return;
    }
    
    const selectedRestaurant = this.outletData[index];
    const selectedRestaurantId = selectedRestaurant.id;
    
    console.log('Current restaurant ID:', this.restaurentId, 'Selected ID:', selectedRestaurantId);
    
    // Clear cart only if switching to a different branch
    if (this.restaurentId != parseInt(selectedRestaurantId)) {
      localStorage.removeItem("foodBasket");
      this.foodBasket = [];
      this.seletedItemId = [];
      this.calculateCartPrice();
    }
    
    // Save the selected branch and update the UI
    localStorage.setItem('selectedRestId', selectedRestaurantId);
    this.restaurentId = parseInt(selectedRestaurantId);
    this.branchData = selectedRestaurant;
    
    // Close the offcanvas after selection
    const offcanvas = document.getElementById('selectOutlet');
    if (offcanvas) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
    
    // Reload the component to reflect changes
    this.ngOnInit();
    this.cdr.detectChanges();
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
    this.ngOnInit();
    this.closeOffcanvas('selectDeliveryLocation');

  }

  /**
   * Method to call menu category
   */
  public getFoodMenuCategoryApi(): void {
    this.closeOffcanvas('selectOutlet');
    this.menuLoading = true;
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
        this.scrollToSection(0)
        // this.mainLoading = false;
        // this.sharedData.sendMenuData(this.menuResponse)

        // if (this.menuResponseFiltered.length > 0) {
        //   this.restaurentLoading = false;
        // }

        // setTimeout(() => {
        //     this.restaurentLoading = false;
        //   }, 2000);
        this.menuLoading = false;  

      },
      error: (error) => { console.log(error); this.menuLoading = false; }

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

        console.log('restaurantDetails', response.data[0]);
        const restaurantDetails: any = response.data[0];
        this.restaurentDetails = restaurantDetails;
        this.restaurentActive = restaurantDetails.active;
        this.serviceable = restaurantDetails.serviceable;
        this.weatherAlert = restaurantDetails.serviceableMessage || 'restaurant is closed';
        this.restaurentName = restaurantDetails.restaurantName;
        // this.customerMessage = restaurantDetails.customerMessage;
        // this.restaurentActive = false;
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
        console.log("this.workingHours",this.workingHours);
      },
      error: (error) => { console.error('Error fetching restaurant Details:', error.error.message); }
    });
  }

  /**
   * Check Item stock
   * @param itemUpdateMessage 
   */

  updateItemStock(itemUpdateMessage: any): void {
    console.log(JSON.stringify(itemUpdateMessage))
    const { itemID, inStock } = itemUpdateMessage;
    const activeStatus = inStock ? '1' : '0';
    this.menuCategoryData[this.selectedCategoryIndex].items.forEach((item: { id: any; active: string; }) => {
      if (itemID.includes(item.id)) {
        item.active = activeStatus;
      }
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
    this.addonResponse = [];
    this.variationResponse = [];
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
          this.addItemQuantity(this.addItemQunatityIndex);

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
    this.closeOffcanvas('addOn');
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
  public addItemQuantity(index: number = -1): void {
    try {
      this.sameAddon = false;
      
      // If index is -1, try to use addItemQunatityIndex
      const itemIndex = index === -1 ? this.addItemQunatityIndex : index;
      
      // Validate inputs with more detailed error messages
      if (typeof itemIndex === 'undefined' || itemIndex === null) {
        console.warn('Item index is not set. Please provide a valid index.');
        return;
      }
      
      if (!Array.isArray(this.foodBasket)) {
        console.warn('Food basket is not initialized');
        return;
      }
      
      if (itemIndex < 0 || itemIndex >= this.foodBasket.length) {
        console.warn(`Index ${itemIndex} is out of bounds for foodBasket (length: ${this.foodBasket.length})`);
        return;
      }

      const basketItem = this.foodBasket[itemIndex];
      
      if (!basketItem) {
        console.warn(`No item found at index ${itemIndex}`);
        return;
      }
      
      if (!basketItem.item) {
        console.warn('Basket item is missing the required item property', basketItem);
        return;
      }

      // Initialize quantity if it doesn't exist
      if (typeof basketItem.item.quantity !== 'number' || isNaN(basketItem.item.quantity)) {
        basketItem.item.quantity = 0;
      }
      
      // Increase quantity
      basketItem.item.quantity += 1;
      
      // Update storage and cart calculations
      this.storefoodBasketData();
      this.calculateCartPrice();
      
      // Close the offcanvas modal
      this.closeOffcanvas('verifySameAddon');
      
    } catch (error) {
      console.error('Error in addItemQuantity:', error);
    }
  }

  /**
      * Method to reduce quantity of the item and remove from array if quantity is 1
      * @param index : Index of selected item from the foodBasket array value
      */
  public reduceItemQuantity(index: number): void {
    this.sameAddon = false;
    
    // Validate the index and food basket
    if (typeof index === 'undefined') {
      console.warn('Item index is undefined');
      return;
    }
    
    if (!Array.isArray(this.foodBasket)) {
      console.warn('Food basket is not an array');
      return;
    }
    
    if (index < 0 || index >= this.foodBasket.length) {
      console.warn(`Index ${index} is out of bounds for foodBasket (length: ${this.foodBasket.length})`);
      return;
    }

    const basketItem = this.foodBasket[index];
    
    if (!basketItem) {
      console.warn(`No item found at index ${index}`);
      return;
    }
    
    if (!basketItem.item) {
      console.warn('Basket item is missing the required item property', basketItem);
      return;
    }

    try {
      if (basketItem.item.quantity <= 1) {
        // Remove the item if quantity is 1 or less
        this.seletedItemId = this.seletedItemId.filter(
          (id: string) => id !== basketItem.item.id
        );
        this.foodBasket.splice(index, 1);
      } else {
        // Decrease quantity
        basketItem.item.quantity -= 1;
      }

      // Update storage and cart calculations
      this.storefoodBasketData();
      this.calculateCartPrice();
    } catch (error) {
      console.error('Error in reduceItemQuantity:', error);
    }
  }

  public reduceItemQuantitycustom(index: number): void {
    if (!this.foodBasket || index < 0 || index >= this.foodBasket.length) {
      console.warn('Invalid index or food basket is empty');
      return;
    }

    try {
      this.sameAddon = false;
      const basketItem = this.foodBasket[index];
      
      if (!basketItem?.item) {
        console.warn('Invalid item at index:', index);
        return;
      }

      if (basketItem.item.quantity <= 1) {
        // Remove the item if quantity is 1 or less
        this.seletedItemId = this.seletedItemId.filter(
          (id: string) => id !== basketItem.item.id
        );
        this.foodBasket.splice(index, 1);
      } else {
        // Decrease quantity
        basketItem.item.quantity -= 1;
      }

      // Update storage and cart calculations
      this.storefoodBasketData();
      this.calculateCartPrice();
    } catch (error) {
      console.error('Error in reduceItemQuantitycustom:', error);
    }
  }
  /**
     * Method invoked on clicking + / - buttons on UI
     * @param opteditem : Selected item value 
     * @param index :Index of selected item from the foodBasket array value
     * @param operation : To add or reduce quantity of the item
     */
  public sameAddonConfirmation(opteditem: any, Itemindex: number, operation: string) {
    if (!this.foodBasket || this.foodBasket.length === 0) {
      console.warn('Food basket is empty');
      return;
    }

    // Ensure the index is valid
    const validIndex = Itemindex >= 0 && Itemindex < this.foodBasket.length && 
                      this.foodBasket[Itemindex]?.item?.id === opteditem.id;
    
    if (!validIndex) {
      // If the index is invalid, try to find the item in the basket
      const foundIndex = this.foodBasket.findIndex((item: any) => item?.item?.id === opteditem.id);
      if (foundIndex === -1) {
        console.warn('Item not found in food basket');
        return;
      }
      Itemindex = foundIndex;
    }

    // Store the index for later use in addItemQuantity
    this.addItemQunatityIndex = Itemindex;

    if (operation === 'reduce') {
      if (opteditem.addon?.length > 0 || opteditem.variation?.length > 0) {
        this.reduceItemQuantitycustom(Itemindex);
      } else {
        this.reduceItemQuantity(Itemindex);
      }
    } else if ((opteditem.addon?.length > 0 || opteditem.variation?.length > 0) && operation === 'add') {
      this.sameAddon = true;
      this.openOffcanvas('verifySameAddon');
      this.selectedItemWithAddon = JSON.parse(JSON.stringify(opteditem));
    } else {
      this.addItemQuantity(Itemindex);
    }
  }

  /**
   * Selected Item for new addon
   */
  addItemwithNewAddon() {
    // this.sameAddon = false;
    console.log("New Aaddon clicked");

    this.closeOffcanvas('verifySameAddon');
    this.openOffcanvas('addOn');
    this.selectItem(this.selectedItemWithAddon);
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
      // console.log(ele);

      if (ele.item.quantity == undefined) {
        // Item price will be 0 if there is variation
        if (ele.addonVariation != undefined) {
          // console.log(ele.addonVariation?.addons);

          this.cartItemPrice = this.cartItemPrice + parseFloat(ele.addonVariation?.varients.price);
          // if(ele.addonVariation?.addons?.data.length > 0){
          //  let addonPrice =  this.getSelectedAddonPrices(ele.addonVariation?.addonDetails, ele.addonVariation?.addons);
          //  console.log('addonPrice',addonPrice);

          // }
        } else {
          this.cartItemPrice = this.cartItemPrice + parseFloat(ele.item.price);
        }
      } else {
        // Item price will be 0 if there is variation
        if (ele.addonVariation != undefined && ele.addonVariation?.varients != undefined) {
          this.cartItemPrice = this.cartItemPrice + (parseFloat(ele.addonVariation.varients.price) * parseInt(ele.item.quantity));

        } else {
          this.cartItemPrice = this.cartItemPrice + parseInt(ele.item.price) + (parseFloat(ele.item.price) * parseInt(ele.item.quantity));
        }

        if (ele.addonVariation?.addons != undefined && ele.addonVariation == undefined) {
          let addonPrice: any = this.getSelectedAddonPrices(ele.addonVariation?.addonDetails, ele.addonVariation?.addons.data);
          // console.log('addonPrice', addonPrice);
          this.cartItemPrice = this.cartItemPrice + (parseFloat(addonPrice) * parseInt(ele.item.quantity));

        }

      }
    });
  }
  /**
     * To Check the selected addon on add quantity is same or not
     * @param newItemAddon : Value of the selected addon 
     * @param existingItemAddon : Existing addon value of that item
     * @returns : Boolean value of true / false is added addon Item same or not
     */
  public sameAddonItems(newItemAddon: any, newItemVariationAddon: any, existingItemAddon: any): Boolean {
    // console.log(newItemAddon, newItemVariationAddon, existingItemAddon);
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
    // console.log(is_equal, 'is_equal');
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
      // console.log(this.offcanvasInstance);
    }

    const element = document.getElementById('section-' + sectionId);
    const headerHeight = document.getElementById('veg-nonveg-filter')?.clientHeight || 0;
    this.selectedCategoryIndex = sectionId;

    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;

    if (element && scrollContainer) {
      const elementPosition = element.offsetTop - headerHeight;

      scrollContainer.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }

    this.closeOffcanvas('foodMenu');
    this.closeOffcanvas('addOn');
    // const offcanvasElement = document.getElementById('foodMenu');

    // if (offcanvasElement) {
    //   this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
    //   console.log(this.offcanvasInstance);

    // }

    // const element = document.getElementById('section-' + sectionId);
    // const headerHeight = document.getElementById('veg-nonveg-filter')?.clientHeight || 0;
    // this.selectedCategoryIndex = sectionId;



    // if (element) {
    //   const topPosition = element.offsetTop - headerHeight; // Adjust for header height
    //   window.scrollTo({
    //     top: topPosition,
    //     behavior: 'smooth', // Smooth scrolling
    //   });
    // }
    // this.closeOffcanvas('foodMenu');
  }


  /**
   * TO close the backdrop on clicking outside the canvas
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideOffcanvas = (event.target as HTMLElement).closest('.offcanvas.show');
    if (!clickedInsideOffcanvas && this.addOnBackdrop) {
      this.removeOffcanvasBackdrop();
      // this.closeOffcanvas('contactSupport');
      // this.closeOffcanvas('foodMenu');
      // this.closeOffcanvas('selectOutlet');
      // this.closeOffcanvas('addOn');
      // this.closeOffcanvas('verifySameAddon');
    }
  }
  removeOffcanvasBackdrop() {
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');
    backdrops.forEach((backdrop) => backdrop.remove());
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
        this.renderer.setStyle(document.body, 'overflow', 'auto');
      }
      // const backdrop = document.querySelector('.offcanvas-backdrop');
      const backdrops = document.querySelectorAll('.offcanvas-backdrop');
      console.log(backdrops, 'backdrops');

      if (backdrops) {
        // backdrop.remove();
        backdrops.forEach((backdrop: any) => backdrop.remove());
        this.renderer.setStyle(document.body, 'overflow', 'auto');
      }

    }

    document.body.style.overflow = 'auto';
  }

  public showBranches(): void {
    this.openOffcanvas('selectOutlet');
    this.checkChangeBranch = false;
  }

  public openOffcanvas(offcanvasId: string) {
    const offcanvasElement = document.getElementById(offcanvasId);
    if (offcanvasId == 'selectOutlet') {
      if (offcanvasElement) {
        this.offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement, {
          backdrop: 'static',
          keyboard: false
        });
        this.offcanvasInstance.show();
      }
    } else {
      if (offcanvasElement) {
        const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
        bsOffcanvas.show();
      }
    }
    offcanvasId == 'addOn' ?  this.addOnBackdrop = true :  this.addOnBackdrop = false;

  }

  /**
   * Method to navigate to cart page
   */
  public navigateCart(): void {
    if (this.restaurentActive && this.serviceable) {
      this.router.navigate(['/cart']);
    }


  }

  public getSelectedAddonPrices(selectedData: any, addonGroups: any[]) {
    // console.log(selectedData, addonGroups);
    let totalAddonPrice = 0;
    addonGroups.forEach(group => {
      const selectedDataGroup = selectedData.find((data: { id: any; }) => data.id === group.addonGroupId);

      if (selectedDataGroup) {
        group.selectedAddon.forEach((selectedItemId: any) => {
          const selectedItem = selectedDataGroup.addonItems.find((item: { id: any; }) => item.id === selectedItemId);

          if (selectedItem) {
            totalAddonPrice += parseFloat(selectedItem.addonItemPrice);
          }
        });
      }
    });
    // console.log(totalAddonPrice, 'totalAddonPrice');

    return totalAddonPrice;
    //OLD
    // let price = 0;
    // selectedData.map((group: any, index: number) => {
    //   group.addonItems.forEach((item: any) => {
    //     if (addonGroups[index].selectedAddon.includes(item.id)) {
    //       console.log(item.addonItemPrice, 'dugufusdfhsj');
    //       price = item.addonItemPrice;

    //     }
    //   });
    // });
    // return price;





    // return selectedData.map((group:any) => {
    //   const matchingGroup = addonGroups.find(addonGroup => addonGroup.id === group.addonGroupId);

    //   if (matchingGroup) {
    //     return group.selectedAddon.map((selectedId:any) => {
    //       const matchingAddon = matchingGroup.addonItems.find((item:any) => item.id === selectedId);
    //       return matchingAddon ? { id: selectedId, price: matchingAddon.addonItemPrice } : null;
    //     }).filter(Boolean);
    //   }

    //   return [];
    // }).flat();
  }
  /**
   * Veg Non-veg Filter
   */
  public vegNonvegFilter(type: string) {
    this.itemFilterType == type ? this.itemFilterType = "" : this.itemFilterType = type;
    console.log(this.itemFilterType);

  }

  /**
   * Change branch action event
   * @param event Event Action
   */
  public getBranchSelAction(event: any): void {
    console.log(event);
    // this.checkChangeBranch = false ;
    if (event.action == 'continue') {
      this.showBranches();
      this.openOffcanvas('selectOutlet');
      this.checkChangeBranch = false;
    } else {
      this.closeOffcanvas('selectOutlet');
      // this.checkChangeBranch = false ;
    }
  }

  scrollToSections(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }


  /**
   * For category slider scroll 
   * @param event 
   */
  onScroll(event: WheelEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (event.deltaY !== 0) {
      event.preventDefault();
      target.scrollLeft += event.deltaY;
    }
  }

  /**
  * To fetch order history
  */
  getOrderHistory(): void {
    if (this.customerDetails) {
      const orderStaus = ['PAID', 'ACCEPTED', 'MARK_FOOD_READY', 'OUT_FOR_PICKUP', 'REACHED_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'REACHED_DELIVERY']
      this.apiService.getMethod(`/order?customerId_eq=${this.customerDetails.id}`).subscribe({
        next: (reponse) => {
          // this.orderHistory = reponse.data;
          console.log(reponse.data);
          let length = reponse.data.length;
          if (orderStaus.includes(reponse.data[length - 1]?.status)) {
            this.showTracking = true;
          }
        },
        error: (error) => { console.log(error) }
      })
    }
  }



// Add this method to handle order updates
setupOrderUpdates() {
  this.orderUpdateSubscription = this.wsService.getOrderStatusUpdates().subscribe((orderUpdate: any) => {
    this.ngZone.run(() => {
      // Update the live orders list
      this.updateLiveOrders([orderUpdate]);
      this.cdr.detectChanges();
    });
  });
}

// Update the fetchOrders method to handle initial load
fetchOrders() {
  if (!this.customerDetails?.id) return;

  this.apiService.getMethod(`/order?sortField=id&customerId_eq=${this.customerDetails?.id}`).subscribe({
    next: (response) => {
      this.updateLiveOrders(response.data);
      // If we don't have a WebSocket subscription yet, set it up
      if (!this.orderUpdateSubscription) {
        this.setupOrderUpdates();
      }
    },
    error: (error) => { 
      console.error('Error fetching orders:', error);
      // Still try to set up WebSocket in case of error
      if (!this.orderUpdateSubscription) {
        this.setupOrderUpdates();
      }
    }
  });
}

// Helper method to update live orders
private updateLiveOrders(orders: any[]) {
  const liveStatuses = [
    'PAID', 'ACCEPTED', 'MARK_FOOD_READY', 'OUT_FOR_PICKUP',
    'REACHED_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'
  ];
  
  const today = new Date();
  this.liveOrders = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return liveStatuses.includes(order.status) && 
             orderDate.getDate() === today.getDate() &&
             orderDate.getMonth() === today.getMonth() &&
             orderDate.getFullYear() === today.getFullYear();
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  this.showLiveOrders = this.liveOrders.length > 0;
}

// Update the orderTrack method to handle navigation better
orderTrack(event: MouseEvent, order: any) {
  event.stopPropagation();
  if (order?.id) {
    this.router.navigate(['/order-tracking'], { 
      queryParams: { id: order.id },
      state: { orderData: order } // Pass order data for immediate display
    }).catch((err) => {
      console.error('Navigation failed:', err);
      this.router.navigate(['/order']);
    });
  }
}

// Add to ngOnDestroy to clean up subscriptions
ngOnDestroy() {
  if (this.wsSubscription) {
    this.wsSubscription.unsubscribe();
  }
  if (this.orderUpdateSubscription) {
    this.orderUpdateSubscription.unsubscribe();
  }
  // this.stopOrderPolling(); // Clean up polling subscription
}

  /**
   * To fetch live order
   */
  // fetchOrders() {
  //   this.apiService.getMethod(`/order?sortField=id&customerId_eq=${this.customerDetails.id}`).subscribe({
  //     next: (response) => {
  //       this.liveOrderId = this.getCurrentLiveOrderIds(response.data);
  //       console.log('Live Order ID:', this.liveOrderId); // Debug: see if it's set
  //     },
  //     error: (error) => { console.log(error) }
  //   });
  // }

  goToTodayList() {
    if (this.liveOrders) {
      this.router.navigate(['/order-tracking'], { 
        queryParams: { id: this.liveOrders[0].id },
        state: { orderData: this.liveOrders } // Pass order data for immediate display
      }).catch((err) => {
        console.error('Navigation failed:', err);
        this.router.navigate(['/order']);
      });
    }
  }
  
  // orderTrack(event: MouseEvent, id: number) {
  //   event.stopPropagation(); // Prevents the button's click event
  //   if (this.liveOrderId && this.liveOrderId != null && this.liveOrderId.length > 0) {
  //     this.router.navigate(['/order-tracking'], { queryParams: { id: id } })
  //       .catch((err) => {
  //         console.error('Navigation failed:', err);
  //         this.router.navigate(['/order-today-history']);
  //       });
  //   }
  // }

calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Radius of the earth in km
  const dLat = this.deg2rad(lat2 - lat1);
  const dLon = this.deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = (R * c)+ 1.4; // Distance in km
  return distance.toFixed(1); // Return distance with 1 decimal place
}

private deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

getCurrentLocation(): { latitude: number, longitude: number } | null {
  const location = localStorage.getItem('selectedLocation');  
  if (location) {
    const loc = JSON.parse(location);
    return loc?.location || null;
  }
  return null;
}

getOutletDistance(item: any): string {
  const currentLocation = this.getCurrentLocation();
  if (!currentLocation || !item?.location) return '';
  
  return this.calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    item.location.latitude,
    item.location.longitude
  );
}

  getCurrentLiveOrderIds(orders: any[]): number[] {
    const liveStatuses = [
      'PAID', 'ACCEPTED', 'MARK_FOOD_READY', 'OUT_FOR_PICKUP',
      'REACHED_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'REACHED_DELIVERY'
    ];
    const today = new Date();
    // Filter all orders with a live status for today and map to their IDs
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return liveStatuses.includes(order.status) && orderDate.getDate() === today.getDate();
      })
      .map(order => order.id);
  }

  // Add this method to handle successful feedback submission
  onFeedbackSubmitted(success: boolean): void {
    // You can add any logic here to handle successful feedback submission
    console.log('Feedback submitted successfully:', success);
    // For example, show a success message to the user
    // this.toastr.success('Thank you for your feedback!');
  }

  // Add this method to handle feedback submission errors
  onFeedbackError(error: any): void {
    console.error('Error submitting feedback:', error);
    // Handle the error, e.g., show an error message
    // this.toastr.error('Failed to submit feedback. Please try again.');
  }

  // Add this method to sort restaurants by distance
  private sortRestaurantsByDistance(restaurants: any[]): any[] {
    if (!restaurants || !Array.isArray(restaurants)) return [];
    
    return [...restaurants].sort((a, b) => {
      const distanceA = parseFloat(this.getOutletDistance(a) || '0');
      const distanceB = parseFloat(this.getOutletDistance(b) || '0');
      return distanceA - distanceB;
    });
  }
}