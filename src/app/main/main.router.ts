import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
    {
        path: '',
        component: MainPage,
        children: [
            {
                path: 'home',
                loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
            },
            {
                path: 'qrcode',
                loadChildren: () => import('../pages/qr-code/qr-code.module').then(m => m.QrCodePageModule)
            },
            {
                path: 'account',
                loadChildren: () => import('../pages/account/account.module').then(m => m.AccountPageModule)
            },
            {
                path: 'topUp',
                loadChildren: () => import('../pages/top-up/top-up.module').then(m => m.TopUpPageModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MainRouter { }
