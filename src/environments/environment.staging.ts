export const environment = {
    baseUrl: 'https://api.hyperapps.digital/api/v2',
    baseWsUrl: 'wss://api.hyperapps.digital/api/v2/ws',
    restId: '14490',
    partnerId: 'ju8tCXSeun',
    production: false,
    razorPayKey: 'rzp_test_dUt1jZJm3Whtxk',
    title: 'Hyperapps',
    contactRestaurant: "9642887733",
    contactHyperapps: "8885026686",
    flatDiscountpercentage: 25,
    deliveryDiscount: 30,
    itemdiscountValue: 0,
    itempackagingCharge: 10,  // Set Packing charge as applicable
    packingTaxPercentage: 5,  // Packing charge tax in percentage
    googleMapApiKey: 'AIzaSyDROVRwoyWdPPqvrzrA947dxZ-9F0HgRWw',
    WHATSAPP_API_URL: 'https://graph.facebook.com/v22.0/112915418570784/messages',
    WHATSAPP_TOKEN: 'EAAxcoXYnGfgBO1qwf4g9ZBCatP9PO8ZCTZA8ZBR50gLBXeF0Kd9rlP6uT4hwvyzuOQRnPF6iRH9r8e7bRMGqCHgnEce87AF3duKFvzwBjoZCZBJMHilifHqS7DOHiGVU28pnYmPhe6uHvB9MmsuAARoV1ZBm6E2SyCtuMGojskokRZAZCKCw4ZB3gIlufSVEKBfQJhEAZDZD',
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
