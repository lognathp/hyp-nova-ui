export const environment = {
    //baseUrl:'https://aardvark-notable-terminally.ngrok-free.app/api/v2',
    //baseWsUrl:'ws://aardvark-notable-terminally.ngrok-free.app/api/v2/ws',
    baseUrl:'https://api.hyperapps.in/api/v2',
    baseWsUrl:'wss://api.hyperapps.in/api/v2/ws',
    restId:'135348',
    partnerId:'Lbqg9o4ib2',
    production: false,
    razorPayKey:'rzp_test_dUt1jZJm3Whtxk',
    title:'Wacky Wok',
    contactRestaurant:"6301100915",
    contactHyperapps:"8885025585",
    flatDiscountpercentage : 25,
    deliveryDiscount : 0,
    itemdiscountValue : 0,
    itempackagingCharge: 0,  // Set Packing charge as applicable
    packingTaxPercentage:0,  // Packing charge tax in percentage
    googleMapApiKey: 'AIzaSyDROVRwoyWdPPqvrzrA947dxZ-9F0HgRWw',
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
