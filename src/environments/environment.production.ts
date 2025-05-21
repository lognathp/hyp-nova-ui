export const environment = {
    baseUrl:'https://api.hyperapps.in/api/v2',
    baseWsUrl:'wss://api.hyperapps.in/api/v2/ws',
    restId:'14490',
    partnerId:'7ycrA3dec5',
    production: true,
    razorPayKey:'rzp_live_oUdd0v4WZIGGRP',
    title:'Hyperapps',
    contactRestaurant:"9642887733",
    contactHyperapps:"8885026686",
    flatDiscountpercentage : 0,
    deliveryDiscount : 0,
    itemdiscountValue : 0,
    itempackagingCharge: 10,  // Set Packing charge as applicable
    packingTaxPercentage:5,  // Packing charge tax in percentage
    googleMapApiKey: 'AIzaSyDROVRwoyWdPPqvrzrA947dxZ-9F0HgRWw',
    deliveryOptions: [
        // Un-comment to add options Comment to remove delivery options
        { label: 'Delivery', value: '1', index: 0 },   // Default type dont-touch
        { label: 'Take Away', value: '3', index: 1 },
        // { label: 'Dine In', value: '2', index: 2 }
    ],
    deliveryWaiver:{
        applicable:false,
        offsetValue:199,
    }
};
