import { environment } from "../../environments/environment";

export const Config = {
    base_url: environment.baseUrl,
    ws_url: environment.baseWsUrl,
    rest_id :environment.restId,
    partnerId :environment.partnerId,
    razorpay_key: environment.razorPayKey
}