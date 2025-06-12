export const environment = {
    baseUrl: 'https://aardvark-notable-terminally.ngrok-free.app/api/v2',
    baseWsUrl: 'ws://aardvark-notable-terminally.ngrok-free.app/api/v2/ws',
    restId: '14490',
    partnerId: 'ju8tCXSeun',
    production: false,
    razorPayKey: 'rzp_test_dUt1jZJm3Whtxk',
    title: 'Hyperapps',
    contactRestaurant: "9642887733",
    contactHyperapps: "7801057583",
    flatDiscountpercentage: 25,
    deliveryDiscount: 30,
    itemdiscountValue: 0,
    itempackagingCharge: 10,  // Set Packing charge as applicable
    packingTaxPercentage: 5,  // Packing charge tax in percentage
    googleMapApiKey: 'AIzaSyDROVRwoyWdPPqvrzrA947dxZ-9F0HgRWw',
    deliveryOptions: [
        // Un-comment to add options Comment to remove delivery options
        { label: 'Delivery', value: '1', index: 0 },   // Default type dont-touch
        { label: 'Take Away', value: '3', index: 1 },
        // { label: 'Dine In', value: '2', index: 2 }
    ],
    deliveryWaiver: {
        applicable: false,
        offsetValue: 199,
    }
};
