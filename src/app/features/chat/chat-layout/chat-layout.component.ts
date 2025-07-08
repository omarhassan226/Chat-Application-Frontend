import { AfterViewChecked, AfterViewInit, Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChatService } from '../../../core/services/chat/chat.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocketService } from '../../../core/services/socket/socket.service';

@Component({
  selector: 'app-chat-layout',
  standalone: false,
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent implements AfterViewChecked {

  @ViewChild('messageContainer') msgContainer!: ElementRef;
  // @ViewChildren('messageItem') messageItems!: QueryList<any>;

  theme: 'light' | 'dark' = 'light';
  users: any;
  privateMessages: any;
  user1Data: any;
  user2Data: any;
  textMessage: any;
  chatForm: any = FormGroup

  constructor(private renderer: Renderer2, private authService: AuthService, private chatSerivce: ChatService, private fb: FormBuilder, private socket: SocketService) {
    this.chatForm = fb.group({
      text: ['', Validators.required]
    })
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const el = this.msgContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { }
  }

  ngOnInit() {
    this.theme = localStorage.getItem('theme') as any || 'light';
    this.applyTheme();
    this.getAllUsers()
    this.getMe();

    this.socket.listen<any>('receivePrivateMessage')
      .subscribe(msg => {
        this.privateMessages.push(msg);
        console.log('Received private message:', msg);
      });

    this.socket.listen<{ userId: string }>('typing')
      .subscribe(data => {
        const user = this.users.find((u: any) => u._id === data.userId);
        if (user) user.isTyping = true;
      });


    this.socket.listen<{ userId: string }>('stopTyping')
      .subscribe(data => {
        const user = this.users.find((u: any) => u._id === data.userId);
        if (user) user.isTyping = false;
      });


    // this.socket.listen<{ userId: string; isOnline: boolean }>('userStatus')
    //   .subscribe(({ userId, isOnline }) => {
    //     const user = this.users.find((u: any) => u._id === userId);
    //     console.log(user);

    //     if (user) user.isOnline = isOnline;
    //   });

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
    // console.log(user);

    return user.image !== null ? user.image : 'public/images/chat-background.jpg';
  }


  getMe() {
    this.chatSerivce.getMe().subscribe({
      next: (res: any) => {
        this.user1Data = res.user
        console.log('user1Data', this.user1Data);
      }
    })
  }


  sendMessage() {
    const text = this.chatForm.value.text.trim();
    if (!text) return;

    const payload = {
      senderId: this.user1Data._id,
      receiverId: this.user2Data._id,
      text
    };

    // Emit via Socket.IO
    this.socket.emit('sendMessage', payload);

    // Persist via HTTP to your API
    this.chatSerivce.sendMessage(payload.senderId, payload.receiverId, text)
      .subscribe();

    this.chatForm.reset();
  }


  //ChatGpt

  // typing indicator
  typingTimeout: any;

  notifyTyping() {
    clearTimeout(this.typingTimeout);
    this.socket.emit('userTyping', { userId: this.user1Data._id, to: this.user2Data._id });
    this.typingTimeout = setTimeout(() => {
      this.socket.emit('userStopTyping', { userId: this.user1Data._id, to: this.user2Data._id });
    }, 3000);
  }

  // إرسال مرفق
  attachFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // يمكنك استخدام FormData لإرسال الملف للسيرفر
      console.log('File attached:', file);
    }
  }

  // بلوك
  blockUser(userId: string) {
    this.socket.emit('blockUser', { userId, by: this.user1Data._id });
    alert('User has been blocked!');
  }



}
