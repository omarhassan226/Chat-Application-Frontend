import { animate, style, transition, trigger } from '@angular/animations';

export const slideInAnimation = trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);

export const slideInFromRight = trigger('slideInFromRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);
