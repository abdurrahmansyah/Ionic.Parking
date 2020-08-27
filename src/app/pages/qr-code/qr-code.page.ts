import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserData, GlobalService } from 'src/app/services/global.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.page.html',
  styleUrls: ['./qr-code.page.scss'],
})
export class QrCodePage implements OnInit {

  @Input() kondisi: string;
  @Input() parking_id: string;
  qrData: any;
  elementType: 'url' | 'canvas' | 'img' = 'img';
  timer: any;

  constructor(private modalCtrl: ModalController,
    private globalService: GlobalService) {
  }

  ngOnInit() {
    this.InitializeData();
    this.Timer();
  }

  private InitializeData() {
    var userData = new UserData();
    userData.user_id = this.globalService.userData.user_id;
    userData.user_name = this.globalService.userData.user_name;
    userData.user_tipe_kendaraan = this.globalService.userData.user_tipe_kendaraan;
    userData.user_nopol_kendaraan = this.globalService.userData.user_nopol_kendaraan;
    userData.user_saldo_member = this.globalService.userData.user_saldo_member;
    userData.user_telp = this.globalService.userData.user_telp;
    userData.user_status = this.globalService.userData.user_status;
    userData.statusParkingCrOrUp = this.kondisi == "checkIn" ? "INSERT" : "UPDATE";

    this.qrData = JSON.stringify(userData);
    console.log(this.qrData);
  }

  private Timer() {
    this.timer = setInterval(function () {
      this.ShowRepeatData();
    }.bind(this), 500);
  }

  ShowRepeatData() {
    if (this.kondisi == "checkIn") {
      var data = this.globalService.GetParking(this.globalService.userData.user_nopol_kendaraan, this.kondisi);
      this.SubscribeGetParking(data);
    } else {
      var data = this.globalService.GetParkingById(this.globalService.userData.user_nopol_kendaraan, this.kondisi, this.parking_id);
      this.SubscribeGetParking(data);
    }
  }

  private SubscribeGetParking(data: Observable<any>) {
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        clearInterval(this.timer);
        this.CloseQrCode();
      }
    });
  }

  public CloseQrCode() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
    clearInterval(this.timer);
  }
}
