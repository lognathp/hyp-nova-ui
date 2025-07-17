// src/app/websocket.service.ts
import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { Config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private client: Client;
  private restaurantStatusSubject = new Subject<string>();
  private itemStatusSubject = new Subject<string>();
  private orderStatusSubject = new Subject<string>();
  private restaurentDetailsSubject = new Subject<string>();

  constructor() {
    this.client = new Client({
      brokerURL: Config.ws_url,
      webSocketFactory: () => new SockJS(Config.base_url + '/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket server');
      this.client.subscribe('/topic/restaurant-status', (message: Message) => {
        this.restaurantStatusSubject.next(JSON.parse(message.body));
      });
      this.client.subscribe('/topic/item-status', (message: Message) => {
        this.itemStatusSubject.next(JSON.parse(message.body));
      });
      this.client.subscribe('/topic/order-status', (message: Message) => {
        this.orderStatusSubject.next(JSON.parse(message.body));
      });
      this.client.subscribe('/topic/restaurant-serviceable', (message: Message) => {
        this.restaurentDetailsSubject.next(JSON.parse(message.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error(`Broker reported error: ${frame.headers['message']}`);
      console.error(`Additional details: ${frame.body}`);
    };

    this.client.activate();

  }

  getRestaurantStatusUpdates(): Observable<string> {
    return this.restaurantStatusSubject.asObservable();
  }
  getItemStatusUpdates(): Observable<string> {
    return this.itemStatusSubject.asObservable();
  }
  getOrderStatusUpdates(): Observable<string> {
    return this.orderStatusSubject.asObservable();
  }
  getRestaurentDetails(): Observable<string> {
    return this.restaurentDetailsSubject.asObservable();
  }
}
