import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  imports: [CommonModule]
})
export class LoaderComponent {
  loaderService = inject(LoaderService);

  loading$ = this.loaderService.loading$;

}
