import { Directive, Input, HostListener } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Directive({
  selector: '[gaEvent]'
})
export class GaEventDirective {
  @Input() gaEvent!: string;  // Event name, e.g., 'click_button'
  @Input() gaParams!: object; // Event parameters, e.g., { buttonId: 'submit' }

  constructor(private analytics: AnalyticsService) { }

  @HostListener('click') onClick() {
    this.analytics.sendEvent(this.gaEvent, this.gaParams);
  }
}