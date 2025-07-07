import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ChatComponent } from './chat.component';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [{ path: '', component: ChatLayoutComponent, canActivate:[authGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
