import { HttpClient } from '@angular/common/http';
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class ServiceComponent {
  private url = "http://localhost:8080/";

  constructor(
    private httpClient: HttpClient
  ) { }
  public getEmployee(idEmployee : any): Observable<any> {
    return this.httpClient.get(this.url + "employee/" + idEmployee);
  }
  public getEmployees(): Observable<any> {
    return this.httpClient.get(this.url + "employees" );
  }

}
