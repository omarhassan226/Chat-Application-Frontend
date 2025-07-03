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
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { ChatLayoutComponent } from './features/chat/chat-layout/chat-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatLayoutComponent,
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
