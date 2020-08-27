import { Injectable } from '@angular/core';
import { InjectorInstance } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { ThrowStmt } from '@angular/compiler';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public userData: UserData = new UserData();
  httpClient = InjectorInstance.get<HttpClient>(HttpClient);
  loading: any;

  constructor(private storage: Storage,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router,
    private authService: AuthenticationService) {
    this.InitializeLoadingCtrl();
  }

  async InitializeLoadingCtrl() {
    this.loading = await this.loadingController.create({
      mode: 'ios'
    });
  }

  public Login(szUserNopol: string, szPassword: string) {
    this.PresentLoading();
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/login.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', szUserNopol);
    postdata.append('user_password', szPassword);

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var userDataFromDb = data.result.find(x => x);
        var userData = this.MappingUserData(userDataFromDb);

        this.storage.set('userData', userData);
        this.loadingController.dismiss();
        this.PresentToast("Login Berhasil");
        this.authService.login();
        this.router.navigate(['home']);
      }
      else {
        this.loadingController.dismiss();
        this.PresentToast("Login Gagal");
      }
    });
  }

  private MappingUserData(userDataFromDb: any) {
    var userData = new UserData();
    userData.user_id = userDataFromDb.user_id;
    userData.user_name = userDataFromDb.user_name;
    // userData.user_saldo_member = userDataFromDb.user_saldo_member; // GAIKUT BIAR GA NYIMPEN DI STORAGE
    userData.user_telp = userDataFromDb.user_telp;
    userData.user_tipe_kendaraan = userDataFromDb.user_tipe_kendaraan;
    userData.user_nopol_kendaraan = userDataFromDb.user_nopol_kendaraan;
    userData.user_status = userDataFromDb.user_status;

    return userData;
  }

  public Logout() {
    this.authService.logout();
  }

  public async GetUserDataFromStorage() {
    await this.storage.get('userData').then((userData) => {
      this.userData = userData;
    });

    this.GetUserSaldo(this.userData.user_nopol_kendaraan);
  }

  public TopUpSaldo(saldoBaru: number, userNopol: string) {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/topUpSaldo.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);
    postdata.append('saldoBaru', saldoBaru.toString());

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var userDataFromDb = data.result.find(x => x);
        this.userData.user_saldo_member = userDataFromDb.user_saldo_member;

        this.loadingController.dismiss();
        this.PresentToast("TopUp Berhasil");
        this.router.navigate(['home']);
      }
      else {
        this.loadingController.dismiss();
        this.PresentToast("Gagal update data saldo");
      }
    });
  }

  public GetUserSaldo(userNopol: string) {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/getSaldo.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var userDataFromDb = data.result.find(x => x);

        this.userData.user_saldo_member = userDataFromDb.user_saldo_member;
      }
      else {
        this.loadingController.dismiss();
        this.PresentToast("Gagal mengambil data saldo");
      }
    });
  }

  public CreateAccount(nomorKendaraan: string, password: string, nama: string, jenisKendaraan: string, telp: string): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/saveAkun.php';

    let postdata = new FormData();
    postdata.append('user_name', nama);
    postdata.append('user_password', password);
    postdata.append('user_telp', telp);
    postdata.append('user_tipe_kendaraan', jenisKendaraan);
    postdata.append('user_nopol_kendaraan', nomorKendaraan);
    postdata.append('user_saldo_member', "0");
    postdata.append('user_status', "Aktif");

    return this.httpClient.post(url, postdata);
  }

  public GetParking(userNopol: string, kondisi: string): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/getParking.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);
    postdata.append('parking_status', kondisi == "checkIn" ? "Proses" : "Close");

    return this.httpClient.post(url, postdata);
  }

  public GetParkingById(userNopol: string, kondisi: string, parking_id: string): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/getParkingById.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);
    postdata.append('parking_status', kondisi == "checkIn" ? "Proses" : "Close");
    postdata.append('parking_id', parking_id);

    return this.httpClient.post(url, postdata);
  }

  public GetDateWithDateParam(dateParam): DateData {
    var dateData = new DateData();
    var months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    var date = new Date(dateParam);

    dateData.date = date;
    dateData.decYear = date.getFullYear();
    dateData.szMonth = months[date.getMonth()];
    dateData.decMonth = date.getMonth() + 1;
    dateData.decDate = date.getDate();
    dateData.szDay = days[date.getDay()];
    dateData.decMinute = date.getMinutes();
    dateData.szMinute = dateData.decMinute < 10 ? "0" + dateData.decMinute : dateData.decMinute.toString();
    dateData.decHour = date.getHours();
    dateData.szHour = dateData.decHour < 10 ? "0" + dateData.decHour : dateData.decHour.toString();
    dateData.decSec = date.getSeconds();
    dateData.szAMPM = dateData.decHour > 12 ? "PM" : "AM";

    return dateData;
  }

  async PresentLoading() {
    await this.loading.present();
  }

  async PresentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: "dark",
      mode: "ios"
    });
    toast.present();
  }
}

export class UserData {
  public user_id: string;
  public user_password: string;
  public user_name: string;
  public user_saldo_member: string;
  public user_telp: string;
  public user_tipe_kendaraan: string;
  public user_nopol_kendaraan: string;
  public user_status: string;
  public statusParkingCrOrUp: string;

  constructor() { }
}

export class ParkingData {
  public parking_id: string;
  public parking_user_id: string;
  public parking_user_name: string;
  public parking_park_lot_id: string;
  public parking_park_lot_name: string;
  public parking_park_lot_biaya_motor: string;
  public parking_park_lot_biaya_mobil: string;
  public parking_waktu_masuk: string;
  public parking_waktu_keluar: string;
  public parking_biaya: string;
  public parking_jenis_pembayaran: string;
  public parking_status: string;

  constructor() { }
}

export class DateData {
  public date: Date;
  public szDay: string;
  public decDate: number;
  public szMonth: string;
  public decYear: number;
  public decHour: number;
  public szHour: string;
  public decMinute: number;
  public szMinute: string;
  public szAMPM: string;
  public decSec: number;
  public decMonth: number;

  constructor() { }
}