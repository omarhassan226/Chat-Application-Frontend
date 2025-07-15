import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  imports: [NgIf, AsyncPipe]
})
export class LoaderComponent {
  loaderService = inject(LoaderService);

  loading$ = this.loaderService.loading$;

}
