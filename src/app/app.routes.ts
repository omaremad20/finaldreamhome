import { Routes } from '@angular/router';
import { authGuard } from './core/gurads/authguard/core/guards/auth.guard';
import { noAuthGuard } from './core/gurads/no-auth.guard';
import { LoginComponent } from './layouts/auth-layouts/login/login.component';

export const routes: Routes = [
  {
    path: ''
    , redirectTo: 'login'
    , pathMatch: 'full',
  },
  {
    path: 'dreamhome',
    loadComponent: () => import('./pages/main/main.component')
      .then((classes) => classes.MainComponent),
    title: 'Dream Home',
    canActivate: [authGuard],
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services.component')
      .then((classes) => classes.ServicesComponent),
    title: 'Services',
    canActivate: [authGuard],
  },
  {
    path: 'dreamhome/service-details',
    loadComponent: () => import('./pages/service-details/service-details.component')
      .then((classes) => classes.ServiceDetailsComponent),
    title: 'Service',
    canActivate: [authGuard],
  },
  {
    path: 'services/service-details',
    loadComponent: () => import('./pages/service-details/service-details.component')
      .then((classes) => classes.ServiceDetailsComponent),
    title: 'Service',
    canActivate: [authGuard],
  },
  { path: 'login', component: LoginComponent, title: 'Login', canActivate: [noAuthGuard], },
  {
    path: 'register',
    loadComponent: () => import('./layouts/auth-layouts/register/register.component')
      .then((classes) => classes.RegisterComponent),
    title: 'Register',
    canActivate: [noAuthGuard],
  },
  {
    path: 'my-profile',
    loadComponent: () => import('./pages/my-profile/my-profile.component')
      .then((classes) => classes.MyProfileComponent),
    title: 'My Profile',
    canActivate: [authGuard],
  },
  {
    path: 'browse-projects',
    loadComponent: () => import('./pages/browseprojects/browseprojects.component')
      .then((m) => m.BrowseprojectsComponent),
    title: 'Browse Projects',
    canActivate: [authGuard],
  },
  {
    path: 'comments/:postId',
    loadComponent: () => import('./pages/comments/comments.component')
      .then((m) => m.CommentsComponent),
    title: 'Comments',
    canActivate: [authGuard],
  },
  {
    path: 'upload-post',
    loadComponent: () => import('./pages/uploadpost/uploadpost.component')
      .then((m) => m.UploadpostComponent),
    title: 'Browse Projects',
    canActivate: [authGuard],
  },
  {
    path: 'single-post',
    loadComponent: () => import('./pages/singlepost/singlepost.component')
      .then((m) => m.SinglepostComponent),
    title: 'post',
    canActivate: [authGuard],
  },
  {
    path: 'chat/:userToGo/:messageToGo',
    loadComponent: () => import('./pages/chat/chat.component')
      .then((m) => m.ChatComponent),
    title: 'Chat',
    canActivate: [authGuard],
  },
  {
    path: 'main-chat',
    loadComponent: () => import('./pages/main-chat/main-chat.component')
      .then((classes) => classes.MainChatComponent),
    title: 'Chat',
    canActivate: [authGuard],
  }
  ,
  {
    path: 'messages',
    loadComponent: () => import('./pages/messages/messages.component').then((classes) => classes.MessagesComponent)
    , title: 'Your Messages'
    , canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notfications/notfications.component').then((classes) => classes.NotficationsComponent)
    , title: 'Your Notfications'
    , canActivate: [authGuard],
  },
  {
    path: 'employee-profile/:employeeId',
    loadComponent: () => import('./pages/employee-profile/employee-profile.component').then((classes) => classes.EmployeeProfileComponent),
    title: 'Employee Profile',
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component')
      .then((classes) => classes.NotFoundComponent),
    title: 'Error 404',
  }
];
