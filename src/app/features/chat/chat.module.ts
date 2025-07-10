import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EmojiPickerComponent } from '@chit-chat/ngx-emoji-picker/lib/components/emoji-picker';

@NgModule({
  declarations: [
    ChatComponent,
    ChatLayoutComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    EmojiPickerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatModule { }
