import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { /*AlertService,*/ AuthenticationService } from '../authentication.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authenticationService: AuthenticationService,
      //private alertService: AlertService
  ) {
      // redirect to home if already logged in
      // if (this.authenticationService.currentUserValue) { 
      //     this.router.navigate(['/']);
      // }
  }

  ngOnInit() {
      this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
          password: ['', Validators.required]
      });

      // get return url from route parameters or default to '/'
      //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.loginForm.invalid) {
          return;
      }

      this.loading = true;
      var username = this.f.username.value;
      var password = this.f.password.value;
      console.log(`In onSubmit(), username is: ${username} and password is: ${password}`);
      this.authenticationService.login(username, password)
          .subscribe(
              isUserValid => {
                console.log(`isUserValid is: ${JSON.stringify(isUserValid)}`);
                if (isUserValid == 'true') {
                    console.log('User is valid!');
                    //Navigate to Dashboard Component
                    this.router.navigateByUrl('/dashboard');
                } else {
                    console.log('User is NOT valid!');
                    this.loginForm.reset();
                    this.loading = false;
                    this.submitted = false;
                    //this.router.navigate([this.returnUrl]);
                }
                
              },
              error => {
                  //this.alertService.error(error);
                  //this.loading = false;
                  console.log(`Login failed: ${JSON.stringify(error)}`);
              });


  }
}
