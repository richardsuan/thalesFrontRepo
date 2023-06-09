import {Component} from '@angular/core';
import {ServiceComponent} from './employee-service/service.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public serviceComponent : ServiceComponent) {
  }
  title = 'Thales Front f por chimuelo';
  textField: string | undefined;
  allData : any;
  submitData(){
    this.serviceComponent.getEmployee(this.textField).subscribe((res:any) =>{
      this.allData=res;
      console.log(this.allData);
    },
        (error: any) => { console.error(error); });
    this.textField='';
  }
  getAllEmployee(){
    this.serviceComponent.getEmployees().subscribe((res:any) =>{
        this.allData=res;
        console.log(this.allData);
      },
      (error: any) => { console.error(error); });
  }
}
