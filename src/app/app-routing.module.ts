import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },   // ✅ default redirect
  {
    path: '',
    loadChildren: () =>
      import('./shared/shared.module').then(m => m.SharedModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat.module').then(m => m.ChatModule)
  },
  { path: '**', redirectTo: 'chat' }  // optional: catch-all rule
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
