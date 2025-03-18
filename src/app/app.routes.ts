import { Routes } from '@angular/router';
import { authGuard } from './core/gaurds/auth.guard';
// import { OrderComponent } from './pages/order/order.component';
// import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path:"", redirectTo:'home', pathMatch:'full'
    },
    {
        path:'home',
        // component: HomeComponent,
        loadComponent: () => import('./pages/home/home.component').then( (m) => m.HomeComponent ),
    },
    {
        path:'order', 
        // component : OrderComponent
        loadComponent: () => import("./pages/order/order.component").then((m) => m.OrderComponent),
    },
    {
        path:'cart', 
        loadComponent: () => import("./pages/cart/cart.component").then((m) => m.CartComponent),
        canActivate:[authGuard]
    },
    {
        path:'login',
        loadComponent: () => import("./pages/login/login.component").then((m) => m.LoginComponent)
    },{
        path:'address',
        loadComponent: () => import("./pages/address/address.component").then((m) => m.AddressComponent),
        canActivate:[authGuard]
    },
    {
        path:"**", redirectTo:'home', pathMatch:'full'
        // path:"**", redirectTo:'order', pathMatch:'full'
    }
];
