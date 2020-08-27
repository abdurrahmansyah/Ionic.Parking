import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  constructor(private globalService: GlobalService) {
    // this.GetSaldo();
  }

  private GetSaldo() {
    this.globalService.GetUserSaldo(this.globalService.userData.user_nopol_kendaraan);
  }

  ngOnInit() {
  }

}
