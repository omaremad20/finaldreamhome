import { Component } from '@angular/core';
import { ContactUsComponent } from "../contact-us/contact-us.component";
import { HomeComponent } from "../home/home.component";
import { ServicesComponent } from "../services/services.component";
import { AboutusComponent } from "../aboutus/aboutus.component";
import { AuthService } from '../../core/services/Auth/auth.service';
import { MyProfileComponent } from "../my-profile/my-profile.component";

@Component({
  selector: 'app-main',
  imports: [HomeComponent, ServicesComponent, ContactUsComponent, AboutusComponent, MyProfileComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(public authService:AuthService){}
}
