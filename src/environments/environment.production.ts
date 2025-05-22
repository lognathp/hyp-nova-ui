export const environment = {
    baseUrl:'https://api.hyperapps.in/api/v2',
    baseWsUrl:'wss://api.hyperapps.in/api/v2/ws',
    restId:'376937',
    partnerId:'sXFZ90j99L',
    production: true,
    razorPayKey:'rzp_live_oUdd0v4WZIGGRP',
    title:'Seenu C/O Bezawada',
    contactRestaurant:"9550888641",
    contactHyperapps:"7801057583",
    // flatDiscountpercentage : 25,
    // deliveryDiscount : 25,
    itemdiscountValue : 0,
    itempackagingCharge: 0,  // Set Packing charge as applicable
    packingTaxPercentage:0,  // Packing charge tax in percentage
    itempackagingCharge: 0,  // Set Packing charge as applicable
    packingTaxPercentage:0,  // Packing charge tax in percentage
    googleMapApiKey: 'AIzaSyDROVRwoyWdPPqvrzrA947dxZ-9F0HgRWw',
    deliveryOptions: [
        // Un-comment to add options Comment to remove delivery options
        { label: 'Delivery', value: '1', index: 0 },   // Default type dont-touch
        // { label: 'Take Away', value: '3', index: 1 },
        // { label: 'Take Away', value: '3', index: 1 },
        // { label: 'Dine In', value: '2', index: 2 }
    ],
    deliveryWaiver:{
        applicable:false,
        offsetValue:199,
    }
};
