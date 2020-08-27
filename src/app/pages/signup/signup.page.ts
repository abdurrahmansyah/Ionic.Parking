import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  public txtNomorKendaraan: string;
  public txtPassword: string;
  public txtConfirmPassword: string;
  public txtNama: string;
  public jenisKendaraan: string;
  public txtTelp: string;
  public isDisabled = true;
  loading: any;

  constructor(private loadingController: LoadingController,
    private globalService: GlobalService,
    private router: Router) {
    this.InitializeLoadingCtrl();
  }

  async InitializeLoadingCtrl() {
    this.loading = await this.loadingController.create({
      mode: 'ios'
    });
  }

  ngOnInit() {
  }

  public OnChangeNomorKendaraan() {
    this.ValidateForButton();
  }

  public OnChangePassword() {
    this.ValidateForButton();
  }

  public OnChangeConfirmPassword() {
    this.ValidateForButton();
  }

  public OnChangeNama() {
    this.ValidateForButton();
  }

  public OnChangeJenisKendaraan() {
    this.ValidateForButton();
  }

  public OnChangeTelp() {
    this.ValidateForButton();
  }

  public Create() {
    try {
      if (this.ValidateForButton()) {
        this.PresentLoading();
        this.ValidatePassword();
        var data = this.globalService.CreateAccount(this.txtNomorKendaraan, this.txtPassword, this.txtNama, this.jenisKendaraan, this.txtTelp);
        this.SubscribeCreateAccount(data);
      }
    } catch (e) {
      this.loadingController.dismiss();
      this.globalService.PresentToast(e.message);
    }
  }

  private ValidateForButton(): boolean {
    if (this.txtNomorKendaraan && this.txtPassword && this.txtConfirmPassword && this.txtNama && this.jenisKendaraan && this.txtTelp) {
      this.isDisabled = false;
      return true;
    }
    else {
      this.isDisabled = true;
      return false;
    }
  }

  private ValidatePassword() {
    if (this.txtPassword != this.txtConfirmPassword)
      throw new Error("Confirm password does not match");
  }

  private SubscribeCreateAccount(data: Observable<any>) {
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        this.loadingController.dismiss();
        this.globalService.PresentToast("Berhasil melakukan create user");
        this.router.navigate(['login']);
      }
      else{
        this.loadingController.dismiss();
        this.globalService.PresentToast(data.error_msg);
      }
    });
  }

  async PresentLoading() {
    await this.loading.present();
  }
}
