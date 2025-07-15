import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoaderComponent } from './components/loader/loader.component';
import { SharedRoutingModule } from './shared-routing.module';

export const materialModules = [
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatCardModule
]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    LoaderComponent,
    ...materialModules
  ]
})
export class SharedModule { }
