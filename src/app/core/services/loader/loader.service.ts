import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private count = 0;
  private _loading = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading.asObservable();

  show() {
    this.count++;
    if (this.count === 1) { this._loading.next(true); }
  }

  hide() {
    if (this.count > 0) {
      this.count--;
      if (this.count === 0) { this._loading.next(false); }
    }
  }
}

