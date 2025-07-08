import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';


@NgModule({
  declarations: [
    ChatComponent,
    ChatLayoutComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    NgbModule,
    ReactiveFormsModule
  ]
})
export class ChatModule { }
