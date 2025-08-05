import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [NgbModal],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  @Input() buttonText = 'Feedback';
  @Input() buttonClass = 'btn btn-outline-primary';
  @Input() customerName = '';
  @Input() orderId = '';
  @Input() restaurantName = '';
  @Input() showAsButton = true;
  
  @Output() feedbackSubmitted = new EventEmitter<boolean>();
  @Output() feedbackError = new EventEmitter<Error>();

  feedbackData = {
    customerName: '',
    orderId: '',
    restaurantName: '',
    message: ''
  };

  isSendingFeedback = false;
  private modalRef: NgbModalRef | null = null;
  isModalOpen = false;
  private readonly WHATSAPP_API_URL = environment.WHATSAPP_API_URL;
  private readonly WHATSAPP_TOKEN = environment.WHATSAPP_TOKEN;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.feedbackData = {
      customerName: this.customerName,
      orderId: this.orderId,
      restaurantName: this.restaurantName,
      message: ''
    };
  }

  toggleFeedbackModal(): void {
    if (this.isModalOpen) {
      this.closeFeedbackModal();
    } else {
      this.openFeedbackModal();
    }
  }

  openFeedbackModal(): void {
    this.isModalOpen = true;
  }

  closeFeedbackModal(): void {
    this.isModalOpen = false;
    this.modalRef = null;
  }

  async submitFeedback(): Promise<void> {
    if (this.isSendingFeedback || !this.feedbackData.message.trim()) return;
    
    this.isSendingFeedback = true;
    
    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      });

      const payload = {
        messaging_product: 'whatsapp',
        to: '918639348511',
        type: 'template',
        template: {
          name: 'report_issue',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: this.feedbackData.customerName || 'N/A' },
                { type: 'text', text: this.feedbackData.orderId || 'N/A' },
                { type: 'text', text: this.feedbackData.restaurantName },
                { type: 'text', text: this.feedbackData.message }
              ]
            }
          ]
        }
      };

      await this.http.post(this.WHATSAPP_API_URL, payload, { headers }).toPromise();
      this.feedbackSubmitted.emit(true);
      this.feedbackData.message = '';
      this.closeFeedbackModal();
    } catch (error) {
      console.error('Error sending feedback:', error);
      const errorMessage = error instanceof HttpErrorResponse 
        ? error.message 
        : 'An unknown error occurred';
      this.feedbackError.emit(new Error(errorMessage));
    } finally {
      this.isSendingFeedback = false;
    }
  }
}
