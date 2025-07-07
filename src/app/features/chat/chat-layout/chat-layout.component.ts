import { Component, Renderer2 } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChatService } from '../../../core/services/chat/chat.service';

@Component({
  selector: 'app-chat-layout',
  standalone: false,
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent {

  theme: 'light' | 'dark' = 'light';
  users: any;
  privateMessages: any;
  user1Data: any;
  user2Data: any;

  constructor(private renderer: Renderer2, private authService: AuthService, private chatSerivce: ChatService) { }

  ngOnInit() {
    this.theme = localStorage.getItem('theme') as any || 'light';
    this.applyTheme();
    this.getAllUsers()
    this.getMe();
    // this.getPrivateMessages(this.user1Data._id, this.user2Data._id)
  }

  toggleTheme() {
    this.theme = (this.theme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    this.renderer.setAttribute(document.documentElement, 'data-bs-theme', this.theme);
  }

  onLogout() {
    this.authService.logout()
  }

  onSettings() {
    // navigate to settings
  }

  getAllUsers() {
    this.chatSerivce.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res
        console.log(this.users);
      }
    })
  }

  getUser(id: any) {
    const user = this.users.find((user: any) => user._id === id || user.id === id);
    this.user2Data = user
    console.log(this.user1Data);
    console.log(this.user2Data);

    this.getMe();

    this.getPrivateMessages(this.user1Data._id, this.user2Data._id)
    if (user) {
      console.log('Selected user:', user);
    } else {
      console.log('User not found');
    }
  }

  getPrivateMessages(user1: any, user2: any) {
    console.log(user2);

    this.chatSerivce.getPrivateMessages(user1, user2).subscribe({
      next: (res: any) => {
        this.privateMessages = res
        console.log('Private Messages:', this.privateMessages);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getUserImage(senderId: string): string {
  const user = this.users.find((u: any) => u._id === senderId);
  console.log(user);

  return user ? user.image : 'assets/images/default-avatar.jpg';
}


  getMe() {
    this.chatSerivce.getMe().subscribe({
      next: (res: any) => {
        this.user1Data = res.user
        console.log('user1Data', this.user1Data);
      }
    })
  }



}
