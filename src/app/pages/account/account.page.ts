import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  public txtUserName: string;
  public txtJenisKendaraan: string;
  public txtNomorKendaraan: string;
  public txtSaldo: string;

  constructor(private globalService: GlobalService) { 
    this.txtUserName = this.globalService.userData.user_name;
    this.txtJenisKendaraan = this.globalService.userData.user_tipe_kendaraan;
    this.txtNomorKendaraan = this.globalService.userData.user_nopol_kendaraan;
    this.txtSaldo = this.globalService.userData.user_saldo_member;

  }

  ngOnInit() {
  }

}
