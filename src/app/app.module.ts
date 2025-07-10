import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './features/auth/auth-routing.module';
import { AuthModule } from './features/auth/auth.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ChatModule } from './features/chat/chat.module';
import { ReactiveFormsModule } from '@angular/forms';
import { provideEmojiPicker } from '@chit-chat/ngx-emoji-picker/lib/providers';
import { EmojiPickerModule } from '@chit-chat/ngx-emoji-picker/lib/providers';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    AuthRoutingModule,
    CoreModule,
    SharedModule,
    LoaderComponent,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    ChatModule,
    ReactiveFormsModule,
    EmojiPickerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideEmojiPicker()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
