import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-top-up',
  templateUrl: './top-up.page.html',
  styleUrls: ['./top-up.page.scss'],
})
export class TopUpPage implements OnInit {

  userSaldo: string;
  totalTopUp: string;
  loading: any;

  constructor(private globalService: GlobalService,
    private loadingController: LoadingController) {
    this.InitializeLoadingCtrl();
    var saldo = this.globalService.userData.user_saldo_member.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    this.userSaldo = saldo;
  }

  ngOnInit() {
  }

  async InitializeLoadingCtrl() {
    this.loading = await this.loadingController.create({
      mode: 'ios'
    });
  }

  topUp() {
    try {
      this.PresentLoading();
      this.ValidateForTopUp();
      var saldoBaru = +this.totalTopUp + +this.globalService.userData.user_saldo_member;
      this.globalService.TopUpSaldo(saldoBaru, this.globalService.userData.user_nopol_kendaraan);
    } catch (e) {
      this.loadingController.dismiss();
      this.globalService.PresentToast(e.message);
    }
  }

  private ValidateForTopUp() {
    if (!(+this.totalTopUp > 0))
      throw new Error("Input character must be number");
  }

  async PresentLoading() {
    await this.loading.present();
  }
}
