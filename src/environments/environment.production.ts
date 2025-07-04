export const environment = {
    baseUrl:'https://api.hyperapps.in/api/v2',
    baseWsUrl:'wss://api.hyperapps.in/api/v2/ws',
    restId:'15162',
    partnerId:'ACUDTttX1H',
    production: true,
    razorPayKey:'rzp_live_oUdd0v4WZIGGRP',
    title:'Chaitanya Food Court',
    contactRestaurant:"7801057583",
    contactHyperapps:"7801057583",
    // flatDiscountpercentage : 25,
    // deliveryDiscount : 55,
    itemdiscountValue : 0,
    itempackagingCharge: 0,  // Set Packing charge as applicable
    packingTaxPercentage:0,  // Packing charge tax in percentage
    googleMapApiKey: 'AIzaSyDROVRwoyWdPPqvrzrA947dxZ-9F0HgRWw',
    WHATSAPP_API_URL: 'https://graph.facebook.com/v22.0/112915418570784/messages',
    WHATSAPP_TOKEN: 'EAAxcoXYnGfgBO1qwf4g9ZBCatP9PO8ZCTZA8ZBR50gLBXeF0Kd9rlP6uT4hwvyzuOQRnPF6iRH9r8e7bRMGqCHgnEce87AF3duKFvzwBjoZCZBJMHilifHqS7DOHiGVU28pnYmPhe6uHvB9MmsuAARoV1ZBm6E2SyCtuMGojskokRZAZCKCw4ZB3gIlufSVEKBfQJhEAZDZD',
    deliveryOptions: [
        // Un-comment to add options Comment to remove delivery options
        { label: 'Delivery', value: '1', index: 0 },   // Default type dont-touch
        // { label: 'Take Away', value: '3', index: 1 },
        // { label: 'Dine In', value: '2', index: 2 }
    ],
    deliveryWaiver:{
        applicable:false,
        offsetValue:199,
    }
};
