import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { Config } from '../config';

// import { timeout, retryWhen, delay, catchError, scan } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // private backend_url: string = 'https://api.hyperapps.in/api/v2';
  private backend_url: string = Config.base_url;

  constructor(private http: HttpClient) { }
  

  public getMethod(endPoint: string): Observable<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Content-Type': 'application/json'

    });
    
    // if(endPoint.includes('/delivery/quote/')){
      return this.http.get<any>(this.backend_url + endPoint, { headers });
    // } else {
    //   return this.http.get<any>(this.backend_url + endPoint, { headers }).pipe(
    //     timeout(3000),
    //     retryWhen((errors) =>
    //       errors.pipe(
    //         scan((retryCount, error) => {
    //           if (retryCount > 2) {
    //             throw error; 
    //           }
    //           return retryCount + 1;
    //         }, 0),
    //         delay(100)
    //       )
    //     ),catchError((error) => {
    //       console.error('Error or timeout occurred:', error.error.message);
    //       return throwError(() => new Error(error.error.message));
    //     })
    //   );
    // }
    
  }

  public postMethod(endPoint: string, requestBody: any): Observable<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Content-Type': 'application/json'
    });
    return this.http.post(this.backend_url + endPoint, requestBody, { headers });
  }

  public patchMethod(endPoint: string, requestBody: any): Observable<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
      'Content-Type': 'application/json'
    });
    return this.http.patch(this.backend_url + endPoint, requestBody, { headers });
  }

  public deleteMethod(endPoint:string):Observable<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Content-Type': 'application/json'
    });
    return this.http.delete(this.backend_url + endPoint, { headers , observe: 'response' });
  }
}
