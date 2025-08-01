import { AfterViewInit, Component, DoCheck, OnInit } from '@angular/core';
import { debounceTime, Subject, Subscription, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { DiscountPricePipe } from "../../core/pipes/discount-price.pipe";
import { SharedService } from '../../core/services/shared.service';
import { take } from 'rxjs/operators';
import { QuoteLoaderComponent } from "../../components/loaders/quote-loader/quote-loader.component";
import { SomethingWentWrongComponent } from "../../components/errors/something-went-wrong/something-went-wrong.component";
import { WebSocketService } from '../../core/services/websocket.service';
import { RestaurentClosedComponent } from "../../components/errors/restaurent-closed/restaurent-closed.component";
import { SliderSwitchComponent } from "../../components/slider-switch/slider-switch.component";
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule,FormsModule, DiscountPricePipe, QuoteLoaderComponent, SomethingWentWrongComponent, RestaurentClosedComponent, SliderSwitchComponent],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, AfterViewInit, DoCheck {

    contactHyperapps: string = environment.contactHyperapps;

    currentPage: string = "cart";
    foodBasket: any = {};
    menuData: any = {};
    cartList: any = {};
    toPay: number = 0;

    orderTax: any = [];
    quoteData!: any
    showAddAddressButton: boolean = false;
    deliveryDetails: any = {}
    private prepareOrderSubject: Subject<void> = new Subject<void>();

    restaurentId: number | undefined;
    // restaurentId: number = Number(Config.rest_id);

    orderItems: any = [];
    orderPriceDetails: any = {
        itemSubtotal: 0,
        tax: {},
        totalTax: 0,
        addOnPriceSum: 0
    };

    customDetails: any = {};
    showAddressbox: boolean = false;
    showPayment: boolean = false;
    orderSaveResponse: any = {};
    address!: any;
    mobile: any = {};
    sameAddon: boolean = false;

    addItemQunatityIndex!: number
    selectedItemWithAddon: any;
    addonResponse: any = [];
    variationResponse: any = [];
    showAddonVariationDialig: boolean = false;
    quoteLoading: boolean = false;
    connectingGateway: boolean = false;

    flatDiscountpercentage: any;
    /**
     * API error message to show in SomethingWentWrongComponent
     */
    errorMessage: string = '';
    unKnownError: boolean = false;
    restaurentClosed: boolean = false;

    deliveryDiscount : any;

    orderOptions = environment.deliveryOptions;
    orderOptionsType = environment.deliveryOptions[0].value;
    orderOptionsSelectedIndex = environment.deliveryOptions[0].index;

    itempackagingCharge = environment.itempackagingCharge;
    packingTaxPercentage = environment.packingTaxPercentage;

    deliveryWaiver = environment.deliveryWaiver;


    totalPackingCharge = 0;

    isMakePaymentEnabled: boolean = false;

    restaurentActive: boolean = false; // Initialize with a default value

    private wsSubscription!: Subscription;
    workingHours: boolean = true;

    indexOfSameItemWithAddons: any = [];
    branchData: any;
    showTracking: boolean = false;
    deliveryInstructions: string = "";
    serviceable: any;

    constructor(
        public apiService: ApiService,
        public sharedData: SharedService,
        private router: Router,
        private authService: AuthService,
        // private messageService: MessageService,
        // private primengConfig: PrimeNGConfig,
        private wsService: WebSocketService,
    ) { 
        // Initialize with current status from shared service if available
        this.sharedData.getRestaurantDetails().pipe(take(1)).subscribe((data: any) => {
            this.restaurentActive = data.active;
        });
    }


    ngOnInit(): void {
        //   console.log(this.router, window.location.origin);
        let restId: any = localStorage.getItem("selectedRestId")
        this.restaurentId = parseInt(restId);

        const branchdata: any = localStorage.getItem("currentBranch")
        this.branchData = JSON.parse(branchdata)

        // item-level discount
       const branchJson = localStorage.getItem("currentBranch");
            try {
            if (branchJson) {
                this.branchData = JSON.parse(branchJson);
                const percentage = this.branchData.discountPercentage;

                this.flatDiscountpercentage = typeof percentage === 'number'
                ? percentage
                : (percentage !== undefined ? Number(percentage) : 0);
            } else {
                this.branchData = {};
                this.flatDiscountpercentage = 0;
            }
            } catch (e) {
            console.error("Failed to parse currentBranch from localStorage", e);
            this.branchData = {};
            this.flatDiscountpercentage = 0;
            }

            // delivery share 
            const branch = localStorage.getItem("currentBranch");
            try {
            if (branchJson) {
                this.branchData = JSON.parse(branchJson);
                const deliveryDiscount = this.branchData.totalDeliverySharePercentage;

                this.deliveryDiscount = typeof deliveryDiscount === 'number'
                ? deliveryDiscount
                : (deliveryDiscount !== undefined ? Number(deliveryDiscount) : 0);
            } else {
                this.branchData = {};
                this.deliveryDiscount = 0;
            }
            } catch (e) {
            console.error("Failed to parse currentBranch from localStorage", e);
            this.branchData = {};
            this.deliveryDiscount = 0;
            }

      // console.log("flatDiscountpercentage =", this.flatDiscountpercentage);


       
        this.checkWorkingHours();
        
        this.wsSubscription = this.wsService.getRestaurantStatusUpdates().subscribe((webSocketResponse: any) => {
            // console.log(webSocketResponse,'cart webSocketResponse');
            
            this.restaurentActive = webSocketResponse.store_status == 0 ? false : true;
            console.log(this.restaurentActive,'this.restaurentActive in ws');
        });

        this.wsSubscription = this.wsService.getRestaurentDetails().subscribe((webSocketResponse: any) => {
            this.serviceable = webSocketResponse.serviceable;
        });
        
        const foodItem: any = localStorage.getItem("foodBasket");
        const menuData: any = localStorage.getItem("menu");
        this.foodBasket = JSON.parse(foodItem);
        this.menuData = JSON.parse(menuData);
        // console.log('fb', this.foodBasket);
        this.prepareOrderSubject.pipe(
            debounceTime(500) // Adjust debounce time as needed
        ).subscribe(() => {
            this.prepareOrderDetails();
        });

        this.prepareOrderItems();

        let tempcustomDetails: any = localStorage.getItem('customerDetails');
        // if (!tempcustomDetails) {
        this.customDetails = JSON.parse(tempcustomDetails);
        // }

        // this.mobile = this.customDetails.mobile

        // console.log('md',this.menuData);

        // this.sharedData.getMenuData().subscribe((data:any) => {
        //     console.log('menu',data);
        // });
        //   console.log(' this.customDetails', this.customDetails);
        this.loadAddress();
        //   this.sharedData.getSelecetdAddress().subscribe((data: any) => {
        //       console.log('address', data);
        //       if (Object.entries(data).length > 0) {
        //           const tempcustomDetailsformattedAddress = {
        //               addressOne: data.addressOne,
        //               addressTwo: data.addressTwo,
        //               addressType: data.addressType,
        //               landmark: data.landmark,
        //               city: data.city,
        //               state: data.state,
        //               country: data.country,
        //               pincode: data.pincode
        //           }
        //           this.address = Object.values(tempcustomDetailsformattedAddress).filter(part => part !== null && part !== undefined).join(', ');
        //           this.getDeliveryQuote(data.id);
        //       } else {
        //           this.showAddAddressButton = true;
        //       }
        //   });
        this.sharedData.getorderTypeDatadata().subscribe((data: any) => {
            console.log(data, 'getorderTypeDatadata', typeof data);
            if (typeof data === 'string') {
                this.orderOptionsType = data;
                this.orderOptionsSelectedIndex = environment.deliveryOptions[0].index;
            } else {
                this.orderOptionsType = environment.deliveryOptions[0].value;
                this.orderOptionsSelectedIndex = environment.deliveryOptions[0].index;
            }
        });

    }
    ngAfterViewInit(): void {
        // throw new Error('Method not implemented.');
        this.sharedData.getSelecetdAddress().pipe(take(1)).subscribe((data: any) => {
            // console.log('address', data);
            if (Object.entries(data).length > 0) {
                const tempcustomDetailsformattedAddress = {
                    addressOne: data.addressOne,
                    addressTwo: data.addressTwo,
                    addressType: data.addressType,
                    landmark: data.landmark,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode
                }
                this.address = Object.values(tempcustomDetailsformattedAddress).filter(part => part !== null && part !== undefined).join(', ');
                // if(!this.quoteLoading){
                //     this.getDeliveryQuote(data.id);
                // }
                this.checkWorkingHours();
                // console.log(this.workingHours, 'this.workingHours');

                // const quoteDatatemp:any = localStorage.getItem('quoteData')
                // console.log(JSON.parse(quoteDatatemp),'quoteDatatemp');

                // this.workingHours ? this.getDeliveryQuote(data.id) : this.restaurentClosed = true;
                // this.workingHours ? this.getdeliveryQuoteshareddata() : this.restaurentClosed = true;



                let existingDeliveryQuoteData: any = [];
                this.sharedData.getDeliveryQuotedata().subscribe((data: any) => {
                    // console.log(Object.entries(data).length);
                    if (Object.entries(data).length) {
                        existingDeliveryQuoteData = data;

                    }
                });
                console.log(existingDeliveryQuoteData,'existingDeliveryQuoteData');
                
                if (this.workingHours && Object.entries(existingDeliveryQuoteData).length > 0) {
                    // this.getdeliveryQuoteshareddata();
                    this.prepareOrderItems();
                } else if (this.workingHours && existingDeliveryQuoteData.response == undefined) {
                    this.getDeliveryQuote(data.id)
                } else {
                    this.restaurentClosed = true;
                }
                // this.getDeliveryQuote(data.id);
            } else {
                this.showAddAddressButton = true;
            }
        });
    }

    ngDoCheck() {

        this.wsSubscription = this.wsService.getRestaurantStatusUpdates().subscribe((webSocketResponse: any) => {
            //  console.log(webSocketResponse,'webSocketResponse');
            
            this.restaurentActive = webSocketResponse.store_status == 0 ? false : true;
            // this.restaurentActive = false;
        });
        this.wsSubscription = this.wsService.getRestaurentDetails().subscribe((webSocketResponse: any) => {
            this.serviceable = webSocketResponse.serviceable;
        });
    }
    checkWorkingHours() {
        // this.workingHours = this.sharedData.checkWorkingHours();

        this.apiService.getMethod(`/restaurant/${this.restaurentId}`).subscribe({
            next: (response: { data: any[]; }) => {
                localStorage.setItem('restaurantDetails', JSON.stringify(response.data[0]));
                const restaurantDetails: any = response.data[0];
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
            error: (error: any) => { console.error('Error fetching restaurant Details:', error); }
        });
    }

    onPrepareOrderClick(): void {
        if (this.isMakePaymentEnabled) {
            return;
        }
        this.isMakePaymentEnabled = true;
        this.connectingGateway = true;
        this.prepareOrderSubject.next();
    }
    checkLoginandProceed() {
        // console.log(this.customDetails,this.customDetails.id);

        if (this.customDetails?.id) {
            this.onPrepareOrderClick();
        } else {
            this.authService.setReturnUrl(this.router.url);
            this.router.navigate(['/login']);
        }
    }

    loadAddress() {
        const selectedLocation = localStorage.getItem('selectedLocation');
        if (selectedLocation) {
            const locationData = JSON.parse(selectedLocation);
            this.address = locationData.formattedAddress;
        }
    }


    prepareOrderItems(): void {
        this.orderItems = [];
        const itemdiscountValue = environment.itemdiscountValue; // Discount value kept static as of now

        this.foodBasket?.forEach((element: any, index: number) => {
            // console.log(element, index);

            const item: any = {
                name: element.item.itemName,
                description: element.item.itemDescription,
                itemDiscount: itemdiscountValue,   //Kept static since no discount as of now
                price: parseFloat(element.item.price).toFixed(2),
                finalPrice: parseFloat(element.item.price) - itemdiscountValue,  // price - itemDiscount (0 used since no discount as of now)
                quantity: element.item.quantity,
                orderItemTax: [],
                orderAddonItems: []
            }
            element.item.taxes.forEach((taxElement: any) => {
                // console.log(taxElement, 'taxElement', element.item.price, parseFloat(element.item.price) - ((this.flatDiscountpercentage / 100) * parseFloat(element.item.price)));
                let itemPricePostDiscount = parseFloat(element.item.price) - ((this.flatDiscountpercentage / 100) * parseFloat(element.item.price));
                const taxFormat: any = {
                    id: taxElement.id,
                    name: taxElement.taxName,
                    amount: ((parseFloat(taxElement.tax) / 100) * itemPricePostDiscount).toFixed(2),
                    type: taxElement.taxType,
                    price: taxElement.tax
                }
                item.orderItemTax.push(taxFormat);
            });
            // console.log(item);

            this.orderItems.push(item);


            if (element?.addonVariation?.varients != undefined) {  //|| element?.addonVariation?.addons != undefined 
                // console.log(element.addonVariation);
                // item['orderAddonItems'] = {
                //     details: []
                // }
                element.addonVariation.variationaddOns.addOngrp.forEach((addonGroup: any, addongroupIndex: number) => {
                    //   element.addonVariation?.addons?.data.forEach((addonGroup: any, addongroupIndex: number) => {
                    // console.log(addonGroup);

                    addonGroup.addons.forEach((adonId: any, addonIndex: number) => {
                        if (adonId[Object.keys(adonId)[0]] == true) {
                            // console.log(Object.keys(adonId), adonId);

                            const detail: any = {
                                addonItemId: element.addonVariation.varients.addonGroups[addongroupIndex].addonItems[addonIndex].id,
                                name: element.addonVariation.varients.addonGroups[addongroupIndex].addonItems[addonIndex].addonItemName,
                                price: element.addonVariation.varients.addonGroups[addongroupIndex].addonItems[addonIndex].addonItemPrice,
                                quantity: element.item.quantity,
                                group_name: element.addonVariation.varients.addonGroups[addongroupIndex].addonGroupName,
                                group_id: element.addonVariation.varients.addonGroups[addongroupIndex].id

                            }
                            item.orderAddonItems.push(detail);

                        }
                    });
                });


                let itemPrice = parseFloat(element.item.price).toFixed(2);
                let variationPrice = parseFloat(element.addonVariation?.varients?.price).toFixed(2);
                let itemWithVariationPrice: any = Math.max(Number(itemPrice), Number(variationPrice));;
                // console.log(parseFloat(element.item.price).toFixed(2), 'element.item.price', parseFloat(element.addonVariation.varients.price).toFixed(2), itemWithVariationPrice);
                let addonSumPrice = 0;
                // if( item.orderAddonItems?.length > 0){
                //     item.orderAddonItems.map((ele:any) => {
                //         addonSumPrice = addonSumPrice + parseInt(ele.price);
                //     })
                // }
                // console.log(addonSumPrice,'addonSumPrice');

                item['id'] = element.addonVariation.varients.id,
                    item['variationName'] = element.addonVariation.varients.name,
                    item['variationId'] = element.addonVariation.varients.variationId,
                    item.price = (itemWithVariationPrice + addonSumPrice).toFixed(2),
                    item.finalPrice = ((itemWithVariationPrice - itemdiscountValue) + addonSumPrice).toFixed(2), // added for discount on discout value

                    item.orderItemTax.forEach((varientItemTax: any, taxIndex: number) => {
                        // console.log(varientItemTax);
                        if (parseFloat(varientItemTax.amount) == 0.00) {
                            varientItemTax.amount = ((parseFloat(varientItemTax.price) / 100) * parseFloat(element.addonVariation.varients.price)).toFixed(2)
                        }
                    })
                // console.log(item.price, 'item.price');


            } else {
                // console.log('add-on price caluculation');

                if (element?.addonVariation?.addons?.data.length > 0) {
                    // console.log(element?.addonVariation, 'element?.addonVariation');

                    if (element?.addonVariation?.varients == undefined) {

                        // item['orderAddonItems'] = {
                        //     details: []
                        // }
                        //   element.addonVariation.addons.addOngrp.forEach((addonele: any, addonIndex: number) => {

                        // NEW



                        // Loop through addons.data
                        for (const addonGroup of element.addonVariation?.addons?.data) {
                            const addonGroupId = addonGroup.addonGroupId;
                            const selectedAddons = addonGroup.selectedAddon;

                            // Find addonGroup details in addonDetails
                            const addonIndex = element.addonVariation.addonDetails.findIndex((group: any) => group.id === addonGroupId);
                            if (addonIndex !== -1) {
                                const addonGroupDetail = element.addonVariation.addonDetails[addonIndex];

                                // Loop through addonItems
                                for (const items of addonGroupDetail.addonItems) {
                                    if (selectedAddons.includes(items.id)) {
                                        const detail: any = {
                                            addonItemId: items.id,
                                            addonItemName: items.addonItemName,
                                            price: items.addonItemPrice,
                                            quantity: element.item.quantity,
                                            addonGroupName: element.addonVariation.addonDetails[addonIndex].addonGroupName,
                                            addonGroupId: element.addonVariation.addonDetails[addonIndex].id
                                        };
                                        item.orderAddonItems.push(detail);
                                        if (!this.foodBasket[index].addonVariation?.addOnNames.includes(items.addonItemName)) {
                                            this.foodBasket[index].addonVariation?.addOnNames.push(items.addonItemName);
                                        }
                                    }
                                }
                            }
                        }
                        // NEW

                        // element.addonVariation?.addons?.data.forEach((addonele: any, addonIndex: number) => {
                        //     console.log(addonele);

                        //     element.addonVariation.addonDetails[addonIndex].addonItems.forEach((items: any, addonINdex: number) => {


                        //         if (items.id == addonele.selectedAddon) {
                        //             console.log(items.id, addonele.selectedAddon);
                        //             console.log(items);
                        //             const detail: any = {
                        //                 addonItemId: items.id,
                        //                 addonItemName: items.addonItemName,
                        //                 price: items.addonItemPrice,
                        //                 quantity: element.item.quantity,
                        //                 addonGroupName: element.addonVariation.addonDetails[addonIndex].addonGroupName,
                        //                 addonGroupId: element.addonVariation.addonDetails[addonIndex].id

                        //             }
                        //             item.orderAddonItems.push(detail);
                        //             if(!this.foodBasket[index].addonVariation?.addOnNames.includes(items.addonItemName)){
                        //                 this.foodBasket[index].addonVariation?.addOnNames.push(items.addonItemName)
                        //             }

                        //         }
                        //     });
                        //     // if (addonele[Object.keys(addonele)[0]] == true) {


                        //     //     const detail: any = {
                        //     //         addonItemId: element.addonVariation.addonDetails[0].addonItems[addonIndex].id,
                        //     //         addonItemName: element.addonVariation.addonDetails[0].addonItems[addonIndex].addonItemName,
                        //     //         price: element.addonVariation.addonDetails[0].addonItems[addonIndex].addonItemPrice,
                        //     //         quantity: element.item.quantity,
                        //     //         addonGroupName: element.addonVariation.addonDetails[0].addonGroupName,
                        //     //         addonGroupId: element.addonVariation.addonDetails[0].id

                        //     //     }
                        //     //     item.orderAddonItems.push(detail);
                        //     // }
                        // });
                    }

                }
                item['id'] = element.item.id
            }
        });

        // console.log(this.orderItems);
        if (this.orderItems?.length > 0) {
            this.orderPriceDetails = {
                itemSubtotal: 0,
                tax: {},
                totalTax: 0,
                addOnPriceSum: 0
            };
            this.totalPackingCharge = 0;
            this.prepareOrderPrice(this.orderItems);
            this.prepareOrderTax(JSON.stringify(this.orderItems));
            if (!this.isMakePaymentEnabled && this.orderOptionsType != "3") {
                this.getdeliveryQuoteshareddata();
            }
        }
    }

    prepareOrderPrice(orderItems: any) {
        console.log(this.orderItems);

        orderItems.forEach((items: any) => {
            console.log(items);
            items.orderItemTax.forEach((tax: any) => {
                if (tax.name in this.orderPriceDetails.tax) {
                    this.orderPriceDetails.tax[tax.name] += (parseFloat(tax.amount) * items.quantity);
                } else {
                    this.orderPriceDetails.tax[tax.name] = (parseFloat(tax.amount) * items.quantity);
                }
                this.orderPriceDetails.totalTax += (parseFloat(tax.amount) * items.quantity);
                this.orderPriceDetails.totalTax = parseFloat(
                this.orderPriceDetails.totalTax.toFixed(2)
                );

                // console.log(this.orderPriceDetails.totalTax);

            });

            if (items?.orderAddonItems?.length > 0) {
                items.orderAddonItems.forEach((addonDetail: any) => {
                    this.orderPriceDetails.addOnPriceSum += (parseFloat(addonDetail.price) * items.quantity)
                });
            }

            this.totalPackingCharge = this.totalPackingCharge + (this.itempackagingCharge * items.quantity);

            this.orderPriceDetails.itemSubtotal = (parseFloat(this.orderPriceDetails.itemSubtotal) + (parseFloat(items.price)) * items.quantity).toFixed(2)
            this.orderPriceDetails['discount'] = (parseFloat(this.orderPriceDetails.itemSubtotal) * (this.flatDiscountpercentage / 100));
            this.orderPriceDetails.toPay = ((parseFloat(this.orderPriceDetails.itemSubtotal) - (parseFloat(this.orderPriceDetails.itemSubtotal) * (this.flatDiscountpercentage / 100))) + this.orderPriceDetails.totalTax + this.orderPriceDetails.addOnPriceSum + this.totalPackingCharge + (this.totalPackingCharge * (this.packingTaxPercentage / 100))).toFixed(2)
        });
        console.log(this.orderPriceDetails, 'this.orderPriceDetails', this.totalPackingCharge);

    }

    prepareOrderTax(orderItemString: any) {
        // console.log('orderItemsTax',JSON.parse(orderItemString)[0].orderItemTax);
        const orderItemTax: any = JSON.parse(orderItemString)[0].orderItemTax;
        let temOrederTax: any = [];
        orderItemTax.forEach((taxEle: any) => {

            const taxObj = {
                id: taxEle.id,
                title: taxEle.name,
                type: taxEle.type,
                price: taxEle.price,
                tax: taxEle.amount
            }
            temOrederTax.push(taxObj)
        });
        this.orderTax = JSON.stringify(temOrederTax)
        // console.log('this.orderTax', this.orderTax);

    }

    getDeliveryQuote(addressId: string) {
        this.quoteLoading = true;
        let times = 1;
        // console.log(times);
        times++;

        // const tQuoteData = {"data":[{"service":"flash","manifest":false,"quote":{"price":72.33,"eta":{"pickup":null,"drop":null,"pickup_min":null,"drop_min":null},"price_breakup":{"surge":0.0,"items":null,"base_delivery_charge":72.33,"total_gst_amount":0.0,"additional_charges":[]}},"error":null,"token":null,"network_id":60,"network_name":"Flash by Shadowfax","pickup_now":true}],"error":false,"message":"Delivery Quotes Fetched"}
        // const tQuoteData = {"data":[{"service":"pidge-lbnp","manifest":false,"quote":{"price":51.92,"eta":{"pickup":null,"drop":null,"pickup_min":null,"drop_min":null},"price_breakup":{"surge":0.0,"items":null,"base_delivery_charge":40.6392,"total_gst_amount":8.9208,"additional_charges":[]}},"error":null,"token":null,"network_id":345,"network_name":"Ola ONDC","pickup_now":true}],"error":false,"message":"Delivery Quotes Fetched"}
        if (this.quoteLoading) {
            this.apiService.getMethod(`/delivery/quote/${this.restaurentId}?addressId=${addressId}`).pipe(debounceTime(100), take(1)).subscribe({
                next: (reponse: any) => {
                    // console.log("delivery/quote", reponse);
                    this.quoteLoading = false;
                    // reponse = tQuoteData;
                    this.quoteData = reponse;
                    // localStorage.setItem('quoteData',JSON.stringify(reponse))
                    this.sharedData.sendDeliveryQuotedata({ reponse, addressId });
                    // this.assignQuoteData(addressId, reponse);
                    // this.getdeliveryQuoteshareddata();
                    this.prepareOrderItems();
                    // this.orderPriceDetails['deliveryCharge'] = 25;
                    // this.orderPriceDetails['deliveryCharge'] = this.quoteData.data[0].quote.price;

                    // this.orderPriceDetails['deliveryCharge'] = this.quoteData.data[0].quote.price - (this.quoteData.data[0].quote.price * (this.deliveryDiscount / 100));;
                    // // this.orderPriceDetails['dcTaxAmount'] = 10;

                    // this.orderPriceDetails.toPay = (parseFloat(this.orderPriceDetails.toPay) + this.orderPriceDetails['deliveryCharge']).toFixed(2);

                    // this.deliveryDetails['addressId'] = addressId;
                    // this.deliveryDetails['service'] = this.quoteData.data[0].service;
                    // // this.deliveryDetails['service'] ='wefast';
                    // this.deliveryDetails['pickupNow'] = this.quoteData.data[0].pickup_now;
                    // // this.deliveryDetails['pickupNow'] = true;
                    // // this.deliveryDetails['networkId'] = 18;
                    // this.deliveryDetails['networkId'] = this.quoteData.data[0].network_id;
                    // console.log(this.orderPriceDetails, this.quoteData, this.deliveryDetails);

                },
                error: (error: any) => {
                    console.log('getQuote ' + error.error.message);
                    this.quoteLoading = false;
                    this.unKnownError = true;
                    this.showAddAddressButton = true;
                    this.errorMessage = error.error?.message || 'Failed to fetch delivery quote';
                    // this.messageService.add({ severity: 'error', detail: error.error.message, life: 10000 });
                }

            });
        }

    }

    /**
     * Get delivaty quote data shared service
     */
    getdeliveryQuoteshareddata() {
        this.sharedData.getDeliveryQuotedata().subscribe((data: any) => {
            // console.log(Object.entries(data).length);
            if (Object.entries(data).length) {
                this.assignQuoteData(data.addressId, data.reponse)
            }
        });
    }

    /**
     * TO assign quote value to the order element
     * @param addressId Address id
     * @param quoteData Qelivery Quote value response
     */
    assignQuoteData(addressId: any, quoteData: any) {
         this.orderPriceDetails['deliveryCharge'] = 0;
        // console.log(this.deliveryWaiver.applicable, this.orderPriceDetails.itemSubtotal + this.orderPriceDetails.addOnPriceSum - this.orderPriceDetails.discount + this.orderPriceDetails.tax.CGST + this.orderPriceDetails.tax.SGST, this.deliveryWaiver.offsetValue,'deliveryWaiver');
        if (this.deliveryWaiver.applicable == true && (this.orderPriceDetails.itemSubtotal + this.orderPriceDetails.addOnPriceSum - this.orderPriceDetails.discount + this.orderPriceDetails.tax.CGST + this.orderPriceDetails.tax.SGST > this.deliveryWaiver.offsetValue)) {
            this.orderPriceDetails['deliveryCharge'] = 0;
        } else {
           const rawDeliveryCharge = quoteData?.data[0].quote.price - 
                              (quoteData?.data[0].quote.price * (this.deliveryDiscount / 100));
    
            this.orderPriceDetails['deliveryCharge'] = parseFloat(rawDeliveryCharge.toFixed(2));
        }

        this.orderPriceDetails.toPay = (parseFloat(this.orderPriceDetails.toPay) + this.orderPriceDetails['deliveryCharge']).toFixed(2);
        this.deliveryDetails['addressId'] = addressId;
        this.deliveryDetails['service'] = quoteData.data[0].service;
        this.deliveryDetails['pickupNow'] = quoteData.data[0].pickup_now;
        this.deliveryDetails['networkId'] = quoteData.data[0].network_id;

        this.deliveryDetails['deliveryNetwork '] = quoteData;  // Data of delivery quote from the API response without adding discount and any operations


        // console.log(this.orderPriceDetails, quoteData, this.deliveryDetails);


    }


    removeItem(index: number): void {

    }



    async prepareOrderDetails(): Promise<void> {

        const now = new Date();
        let currentTime = now.toISOString();


        let flatDiscountAmount = parseFloat(this.orderPriceDetails.itemSubtotal) * (this.flatDiscountpercentage / 100)
        const taxAmount: any = Object.values(this.orderPriceDetails.tax).reduce((acc: any, curr: any) => parseFloat(acc) + parseFloat(curr), 0);

        if (this.orderOptionsType != "1") {
            this.orderPriceDetails['deliveryCharge'] = 0
            this.orderPriceDetails.toPay = (parseFloat(this.orderPriceDetails.toPay) + this.orderPriceDetails['deliveryCharge']).toFixed(2);
            this.deliveryDetails['addressId'] = '';
            this.deliveryDetails['service'] = '';
            this.deliveryDetails['pickupNow'] = '';
            this.deliveryDetails['networkId'] = '';
            this.deliveryDetails['deliveryNetwork '] = '';
        }
        const orderData = {
            restaurantId: this.restaurentId,
            customerId: this.customDetails.id,
            orderType: this.orderOptionsType,
            paymentType: "ONLINE",
            description: "",
            orderItems: this.orderItems,
            orderTax: JSON.parse(this.orderTax),
            deliveryDetails: this.deliveryDetails,
            specialInstructions: this.deliveryInstructions == "" ? 'N/A' : this.deliveryInstructions,
            orderTime: currentTime,
            expectedDeliveryTime: "",
            // totalAmount: 691,
            // totalAmount: parseFloat(this.orderPriceDetails.itemSubtotal) + parseFloat(taxAmount), // (Sum of final price + sum of tax + delveriy charge + pck charge + service charge) - Discout 
            // restaurantLiableAmt: parseFloat(this.orderPriceDetails.itemSubtotal) + parseFloat(taxAmount),
            // discountAmount: 0,
            discountAmount: flatDiscountAmount,
            totalAmount: (parseFloat(this.orderPriceDetails.itemSubtotal) - flatDiscountAmount) + parseFloat(taxAmount), // (Sum of final price + sum of tax + delveriy charge + pck charge + service charge) - Discout 
            restaurantLiableAmt: (parseFloat(this.orderPriceDetails.itemSubtotal) - flatDiscountAmount) + parseFloat(taxAmount),


            taxAmount: taxAmount,
            // taxAmount: 29.4,
            deliveryCharge: this.orderPriceDetails.deliveryCharge,
            dcTaxAmount: this.orderPriceDetails.dcTaxAmount,
            packagingCharge: this.totalPackingCharge,
            pcTaxAmount: (this.totalPackingCharge * (this.packingTaxPercentage / 100)),
            serviceCharge: 0.0,
            scTaxAmount: 0.0,
            grandTotalAmount: parseFloat(this.orderPriceDetails.toPay)
            // grandTotalAmount: 691
        }

        console.log(orderData);

        await this.placeOrder(JSON.stringify(orderData));
    }

    async placeOrder(orderData: string): Promise<void> {

        console.log(JSON.parse(orderData));

        this.apiService.postMethod('/order', orderData).subscribe({
            next: async (reponse: { data: { id: any; }[]; }) => {
                console.log("Response", reponse);
                // this.sharedData.sendcurrentOrderData(reponse);
                localStorage.setItem("currentOrder", JSON.stringify(reponse));
                await this.callPaymentAPI(reponse.data[0].id);

            },
            error: (error: any) => {
                console.log('getQuote ' + error.error?.message);
                this.quoteLoading = false;
                this.unKnownError = true;
                this.errorMessage = error.error?.message || 'Failed to place order';
                this.restaurentClosed = true;
                this.isMakePaymentEnabled = false;
            },
            complete: () => {
                this.isMakePaymentEnabled = false;
            }
        });

        console.log(this.orderPriceDetails, this.orderItems);
    }

    async callPaymentAPI(orderId: any) {
        this.apiService.postMethod(`/payment/${orderId}`, '').subscribe({
            next: (reponse: { data: any; }) => {
                console.log("Response", reponse);

                this.orderSaveResponse = reponse.data;
                this.connectingGateway = false;
                this.showPayment = true;
                this.router.navigateByUrl('/payment', { state: { orderData: this.orderSaveResponse } });
            },
            error: (error: any) => { console.log(error); this.errorMessage = error.error?.message || 'Failed to place order'; }
        })
        this.isMakePaymentEnabled = false;
    }


    /**
     * Method invoked on clicking + / - buttons on UI
     * @param opteditem : Selected item value 
     * @param index :Index of selected item from the foodBasket array value
     * @param operation : To add or reduce quantity of the item
     */
    sameAddonConfirmation(opteditem: any, index: number, operation: string) {
        console.log(opteditem, index, operation, this.foodBasket);
        this.addItemQunatityIndex = index;
        if (operation == 'reduce') {
            this.reduceItemQuantity();
            //   } else if ((opteditem.addon.length > 0 || opteditem.variation.length > 0) && operation == 'add') {
            //       this.sameAddon = true;
            //       this.selectedItemWithAddon = JSON.parse(JSON.stringify(opteditem));
        } else {
            this.addItemQuantity();
        }
    }


    /**
     * Method called after conforming the select new addon of the selected item
     */
    addItemwithNewAddon() {
        if (this.selectedItemWithAddon.addon.length) {
            this.getAddonItems(this.selectedItemWithAddon.addon, this.selectedItemWithAddon.id);
        }
        if (this.selectedItemWithAddon.variation.length) {
            this.getVariations(this.selectedItemWithAddon.variation, this.selectedItemWithAddon.id);
        }
    }

    /**
     * Method to get the addon values with API 
     * @param addOns : Array of addon - Ids
     */
    getAddonItems(addOns: any, itemId: string): void {
        this.addonResponse = [];
        this.apiService.getMethod(`/item/${itemId}/addons`).subscribe({
            next: (reponse: { data: any; }) => {
                this.addonResponse.push(reponse.data);
                this.sameAddon = false;
                this.showAddonVariationDialig = true;
            },
            error: (error: any) => { console.log(error) }
        });
    }

    /**
     * Method to get the variations values with API 
     * @param variation : Array of variation - Ids
     */
    getVariations(variation: any, itemId: string): void {
        this.variationResponse = [];
        console.log(variation);
        this.apiService.getMethod(`/item/${itemId}/variations`).subscribe({
            next: (reponse: { data: any; }) => {
                this.variationResponse = reponse.data;
                console.log(this.variationResponse);
                this.sameAddon = false;
                if (variation.length == this.variationResponse.length) {
                    this.showAddonVariationDialig = true;
                }
            },
            error: (error: any) => { console.log(error) }
        });
    }

    /**
     * Method invoked after addon popup componet emits value
     * @param event : Data froom the addon popup componet
     */
    getAddedItem(event: any): void {
        this.showAddonVariationDialig = false;
        // console.log('event', event);
        // console.log(this.selectedItemWithAddon);
        // console.log(this.foodBasket[this.addItemQunatityIndex]);

        if (event.action == "add") {

            if (this.indexOfSameItemWithAddons.length > 0) {
                this.indexOfSameItemWithAddons.forEach((indexval: number) => {
                    if ((this.sameAddonItems(event.addonVariation.addOnNames, event.addonVariation.VatiationAddOnName, this.foodBasket[indexval].addonVariation.addOnNames))) {
                        this.addItemQunatityIndex = indexval;
                    }
                });
            }

            if (this.addItemQunatityIndex >= 0 && (this.sameAddonItems(event.addonVariation.addOnNames, event.addonVariation.VatiationAddOnName, this.foodBasket[this.addItemQunatityIndex].addonVariation.addOnNames))) {
                if (this.foodBasket[this.addItemQunatityIndex].addonVariation.varients.id == event?.addonVariation.varients.id) {
                    this.addItemQuantity();

                } else {
                    this.selectedItemWithAddon.quantity = 1;
                    const newItem = {
                        categoryId: this.foodBasket[this.addItemQunatityIndex].categoryId,
                        item: this.selectedItemWithAddon,
                        addonVariation: event?.addonVariation
                    }

                    this.foodBasket.push(newItem);
                }

            } else {
                this.selectedItemWithAddon.quantity = 1;
                const newItem = {
                    categoryId: this.foodBasket[this.addItemQunatityIndex].categoryId,
                    item: this.selectedItemWithAddon,
                    addonVariation: event?.addonVariation
                }

                this.foodBasket.push(newItem);
            }



            // if (this.sameAddonItems(event.addonVariation.addOnNames, this.foodBasket[this.addItemQunatityIndex].addonVariation.addOnNames)) {
            //     this.addItemQuantity();
            // } else {

            //     this.selectedItemWithAddon.quantity = 1;
            //     const newItem = {
            //         categoryId: this.foodBasket[this.addItemQunatityIndex].categoryId,
            //         item: this.selectedItemWithAddon,
            //         addonVariation: event?.addonVariation
            //     }

            //     this.foodBasket.push(newItem);

            // }

            this.storefoodBasketData();
            this.prepareOrderItems();
            this.addonResponse = [];
            this.variationResponse = [];
        }
    }

    /**
     * Method to add qunatity of same item
     */
    addItemQuantity() {
        this.sameAddon = false;
        this.foodBasket[this.addItemQunatityIndex].item.quantity += 1;
        this.storefoodBasketData();
        this.prepareOrderItems();
    }

    /**
     * Method to reduce quantity of the item and remove from array if quantity is 1
     */
    reduceItemQuantity(): void {
        this.sameAddon = false;
        if (this.foodBasket[this.addItemQunatityIndex].item.quantity == 1) {
            this.foodBasket.splice(this.addItemQunatityIndex, 1);
        } else {
            this.foodBasket[this.addItemQunatityIndex].item.quantity -= 1;
        }
        if (this.foodBasket?.length == 0) {
            this.router.navigateByUrl('/order');
        }
        console.log(this.foodBasket, 'this.foodBasket-remove ');

        this.storefoodBasketData();
        this.prepareOrderItems();
    }

    /**
     * To Check the selected addon on add quantity is same or not
     * @param newItemAddon : Value of the selected addon 
     * @param existingItemAddon : Existing addon value of that item
     * @returns : Boolean value of true / false is added addon Item same or not
     */
    sameAddonItems(newItemAddon: any, newItemVariationAddon: any, existingItemAddon: any): Boolean {
        let newAddonTemp: any = [];
        if (newItemAddon.length > 0) {
            newAddonTemp = newAddonTemp;
        } else if (newItemVariationAddon.length > 0) {
            newAddonTemp = newItemVariationAddon;
        }
        // const sortedArray1 = newItemAddon.slice().sort();
        const sortedArray1 = newAddonTemp.slice().sort();
        const sortedArray2 = existingItemAddon.slice().sort();

        let is_equal: Boolean = (newItemAddon.length == existingItemAddon.length) && sortedArray1.every((element: any, index: number) => {
            return element === sortedArray2[index];
        });

        return is_equal;
    }

    /**
     * To store food basket data in local storage so that on going back to menu-page data can be taken from local storage 
     */
    storefoodBasketData(): void {
        localStorage.setItem("foodBasket", JSON.stringify(this.foodBasket));
    }
    selectAddress() {
        this.router.navigate(['/address']);
        this.sharedData.sendDeliveryQuotedata({});
    }

    /**
     * Back to order apge
     */
    back(): void {
        this.router.navigate(['/order']);
    }
    /**
     * To fetch order history
     */
    getOrderHistory(): void {
        if (this.customDetails) {
            const orderStaus = ['PAID', 'ACCEPTED', 'MARK_FOOD_READY', 'OUT_FOR_PICKUP', 'REACHED_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'REACHED_DELIVERY']
            this.apiService.getMethod(`/order?customerId_eq=${this.customDetails.id}`).subscribe({
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

    /**
     * Order Track URL redirect
     */
    orderTrack() {
        this.router.navigate(['/order-tracking']);
    }

    getOrderType(orderType: any) {
        console.log('orderType', orderType);
        this.orderOptionsType = orderType;
        this.sharedData.sendorderTypeDatadata(orderType);

        this.prepareOrderItems();
    }

    ngOnDestroy(): void {
        this.wsSubscription.unsubscribe();
    }
}