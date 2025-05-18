import { Component } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CountdownModule } from 'ngx-countdown';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule,CountdownModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  currentPage: string = "login";
  otp: string = '';
  otpSent: boolean = false;
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  returnUrl!: string;
  submitted = false;
  otpsubmitted: boolean = false;
  otpError: boolean = false;
  restaurentId: number | undefined;
  InvalidOtp: boolean = false;
  showResendOTP: boolean = false;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router) {

  }

  ngOnInit(): void {

    let url = window.location.href;

    // if(url.includes("/login") && localStorage.getItem('customerDetails')){
    //   this.router.navigate(['/order']);
    // }

    this.loginForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')])
    });
    this.otpForm = this.formBuilder.group({
      otp: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')])
      // otp: new FormArray(Array(6).fill(0).map(() => new FormControl('')))
    });

    console.log(this.route.snapshot.queryParams['returnUrl'],'dsfdsf', this.authService.getReturnUrl() );
    //   const returnUrl = this.auth.getReturnUrl() || '/';
    // this.auth.clearReturnUrl();
    if(this.route.snapshot.queryParams['returnUrl'] == undefined){
       this.returnUrl = this.authService.getReturnUrl() || '/';
    } else {
       this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

   

    let restId: any = localStorage.getItem("selectedRestId")
    this.restaurentId = parseInt(restId);

    this.otpForm.valueChanges.subscribe((changes) => {
      console.log('Form changes:', changes);
      this.InvalidOtp = false;
    });

  }

  submitLoginForm(): void {
    // Call API to send login details
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.apiService.postMethod('/login/otp', this.loginForm.value).subscribe({
      next: (response: any) => {
        console.log(response.data);
        this.otpSent = true;
      },
      error: (error: any) => {
        console.error('Error logging in:', error);
        this.InvalidOtp = true;
      }
    });
  }

  submitOtpForm(): void {
    console.log(this.otpForm.value.otp);
    this.otpsubmitted = true;
    if (this.otpForm.invalid) {
      return;
    }
    // let otp = this.otpForm.value.otp.join("");
    let otp = this.otpForm.value.otp;
    // Call API to verify OTP
    if (this.restaurentId != undefined)
      this.apiService.postMethod('/login/verify-otp', { mobile: this.loginForm.value.mobile, otp, restaurantId: this.restaurentId }).subscribe({
        next: (response: any) => {
          localStorage.setItem('customerDetails', JSON.stringify(response.data[0]));
          this.router.navigateByUrl(this.returnUrl);
          // alert('OTP verified successfully')
          // console.log('OTP verified successfully:', response);
        },
        error: (error: any) => {
          this.InvalidOtp = true;
          console.error('Error verifying OTP:', error);
        }
      });
  }

  resendOtp(): void {
    // Call API to resend OTP
    // this.apiService.postMethod('/login/resend-otp', { mobile: this.loginForm.value.mobile }).subscribe({
    this.InvalidOtp = false;
    this.apiService.postMethod('/login/resend-otp/' + this.loginForm.value.mobile, '').subscribe({
      next: (response: any) => {
        console.log('OTP resent successfully:', response);
        // this.otpSent = true;
      },
      error: (error: any) => {
        console.error('Error resending OTP:', error);
      }
    });
  }


  get loginFormError(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  get otpFormError(): { [key: string]: AbstractControl } {
    return this.otpForm.controls;
  }

  get otpControls():any {
    return (this.otpForm.get('otp') as FormArray).controls;
  }

  // Handle Pasting into the first input field
  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const sanitizedData = pastedData.replace(/\D/g, '').slice(0, 6);

    if (sanitizedData.length === 6) {
      sanitizedData.split('').forEach((num, index) => {
        this.otpControls[index].setValue(num);
      });

      const lastInput = document.getElementById(`otp-${sanitizedData.length - 1}`);
      lastInput?.focus();
    }
  }


  // Handle Manual Typing: Move focus to next input
  moveFocus(event: any, index: number) {
    const inputLength = event.target.value.length;
    if (inputLength === 1 && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  timerEvent(event: any) {
    console.log(event);
    if (event.left == 0) { this.showResendOTP = true; }
  }

}
