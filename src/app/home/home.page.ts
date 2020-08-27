import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { ToastController, ModalController, ActionSheetController } from '@ionic/angular';
import { GlobalService, ParkingData, DateData } from '../services/global.service';
import { QrCodePage } from '../pages/qr-code/qr-code.page';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // qrData = 'http://instagram.com/';
  qrData: any;
  scannedCode = null;
  elementType: 'url' | 'canvas' | 'img' = 'canvas';
  userName: string;
  userJenis: string;
  userNopol: string;
  userSaldo: string;
  timerForGetParking: any;
  timerForGetParkingById: any;
  isParking: boolean = false;
  parkingId: string = "";
  parkingDate: string;
  parkingAreaParkir: string;
  parkingJamMasuk: string;
  parkingBiaya: string;

  constructor(private barcodeScanner: BarcodeScanner,
    private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController,
    private globalService: GlobalService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    private router: Router) {

    this.InitializeData();
    // this.Timer();
    // this.RepeatGetParking();
    // this.RepeatGetParkingById();
  }

  ngOnInit() {
    this.Timer();
    this.RepeatGetParking();
    this.RepeatGetParkingById();
  }

  async InitializeData() {
    await this.globalService.GetUserDataFromStorage();

    this.userName = this.globalService.userData.user_name;
    this.userJenis = this.globalService.userData.user_tipe_kendaraan;
    this.userNopol = this.globalService.userData.user_nopol_kendaraan;
  }

  private Timer() {
    setInterval(function () {
      this.ShowRepeatData();
    }.bind(this), 500);
  }

  ShowRepeatData() {
    this.GetSaldo();
    var saldo = this.globalService.userData.user_saldo_member.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    this.userSaldo = saldo;
  }

  private GetSaldo() {
    this.globalService.GetUserSaldo(this.globalService.userData.user_nopol_kendaraan);
  }

  private RepeatGetParking() {
    clearInterval(this.timerForGetParking);

    this.timerForGetParking = setInterval(function () {
      this.RepeatGetParkingData();
    }.bind(this), 500);
  }

  private RepeatGetParkingData() {
    var data = this.globalService.GetParking(this.globalService.userData.user_nopol_kendaraan, "checkIn");
    this.SubscribeGetParking(data);
  }

  private SubscribeGetParking(data: Observable<any>) {
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        clearInterval(this.timerForGetParking);
        this.isParking = true;

        var parkingDataFromDb = data.result.find(x => x);
        var parkingData = this.MappingParkingDataFromDb(parkingDataFromDb);
        var parkingDateData = this.globalService.GetDateWithDateParam(parkingData.parking_waktu_masuk);

        this.parkingId = parkingData.parking_id;
        this.parkingDate = parkingDateData.szDay + ", " + parkingDateData.decDate + " " + parkingDateData.szMonth + " " + parkingDateData.decYear;
        this.parkingAreaParkir = parkingData.parking_park_lot_name;
        this.parkingJamMasuk = parkingDateData.szHour + ":" + parkingDateData.szMinute;
        this.parkingBiaya = this.ReturnBiaya(parkingData, parkingDateData);
      }
    });
  }

  private ReturnBiaya(parkingData: ParkingData, parkingDateData: DateData): string {
    var biaya = this.globalService.userData.user_tipe_kendaraan == "Motor" ? parkingData.parking_park_lot_biaya_motor : parkingData.parking_park_lot_biaya_mobil;
    var date = new Date();

    var totalHour = date.getHours() - parkingDateData.decHour;
    if (date.getMinutes() > parkingDateData.decMinute)
      totalHour += 1;

    return (+biaya * totalHour).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  private MappingParkingDataFromDb(parkingDataFromDb: any): ParkingData {
    var parkingData = new ParkingData();
    parkingData.parking_park_lot_id = parkingDataFromDb.park_lot_id;
    parkingData.parking_park_lot_name = parkingDataFromDb.park_lot_nama;
    parkingData.parking_park_lot_biaya_motor = parkingDataFromDb.park_lot_biaya_motor;
    parkingData.parking_park_lot_biaya_mobil = parkingDataFromDb.park_lot_biaya_mobil;
    parkingData.parking_user_id = parkingDataFromDb.user_id;
    parkingData.parking_user_name = parkingDataFromDb.user_name;
    parkingData.parking_id = parkingDataFromDb.parking_id;
    parkingData.parking_waktu_masuk = parkingDataFromDb.parking_waktu_masuk;
    parkingData.parking_waktu_keluar = parkingDataFromDb.parking_waktu_keluar;
    parkingData.parking_biaya = parkingDataFromDb.parking_biaya;
    parkingData.parking_jenis_pembayaran = parkingDataFromDb.parking_jenis_pembayaran;
    parkingData.parking_status = parkingDataFromDb.parking_status;

    return parkingData;
  }

  private RepeatGetParkingById() {
    clearInterval(this.timerForGetParkingById);

    this.timerForGetParkingById = setInterval(function () {
      this.RepeatGetParkingByIdData();
    }.bind(this), 500);
  }

  private RepeatGetParkingByIdData() {
    if (this.parkingId == "") {
      this.isParking = false;
      clearInterval(this.timerForGetParkingById);
    } else {
      var data = this.globalService.GetParkingById(this.globalService.userData.user_nopol_kendaraan, "checkOut", this.parkingId);
      this.SubscribeGetParkingById(data);
    }
  }

  private SubscribeGetParkingById(data: Observable<any>) {
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        this.parkingId = "";
        this.isParking = false;
        clearInterval(this.timerForGetParkingById);
      }
    });
  }

  DoRefresh(event: any) {
    this.ShowRepeatData();
    this.RepeatGetParking();
    this.RepeatGetParkingById();

    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  async parking(kondisi: number) {
    const modal = await this.modalCtrl.create({
      component: QrCodePage,
      componentProps: {
        'kondisi': kondisi > 0 ? 'checkOut' : 'checkIn',
        'parking_id': this.parkingId
      },
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  // downloadQR() {
  //   const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  //   const imageData = canvas.toDataURL('image/jpeg').toString();
  //   console.log('data: ', imageData);

  //   let data = imageData.split(',')[1];

  //   this.base64ToGallery.base64ToGallery(data,
  //     { prefix: '_img', mediaScanner: true })
  //     .then(async res => {
  //       let toast = await this.toastCtrl.create({
  //         header: 'QR Code daved in your Photolibrary'
  //       });
  //     }, err => console.log('error: ', err)
  //     );
  // }

  logout() {
    this.globalService.Logout();
  }

  async showProfil() {
    const actionSheet = await this.actionSheetController.create({
      header: this.globalService.userData.user_name,
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Account',
        icon: 'shirt-outline',
        handler: () => {
          this.router.navigate(['account']);
        }
      }, {
        text: 'Top Up Saldo',
        icon: 'push-outline',
        handler: () => {
          this.router.navigate(['topUp']);
        }
      }, {
        text: 'Log Out',
        icon: 'log-out-outline',
        // role: 'cancel',
        handler: () => {
          this.globalService.Logout();
        }
      }]
    });
    await actionSheet.present();
  }
}

class UserData {
  public nama: string;
  public kota: string;
  public provinsi: string;
}

class User2Data {
  public nama2: string;
  public kota2: string;
  public provinsi2: string;
}