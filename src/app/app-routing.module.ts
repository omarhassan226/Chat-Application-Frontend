import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule)
},
{
  path: 'auth',
  loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
