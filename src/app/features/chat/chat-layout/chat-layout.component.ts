import { AfterViewChecked, AfterViewInit, Component, ElementRef, NgZone, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChatService } from '../../../core/services/chat/chat.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketService } from '../../../core/services/socket/socket.service';
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, filter, finalize, of, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-chat-layout',
  standalone: false,
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent implements AfterViewChecked {

  @ViewChild('messageContainer') msgContainer!: ElementRef;

  theme: 'light' | 'dark' = 'light';
  users: any;
  privateMessages: any;
  user1Data: any;
  user2Data: any;
  textMessage: any;
  chatForm: any = FormGroup
  isSearching = false;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();
  isTyping!: any

  constructor(private renderer: Renderer2, private authService: AuthService, private chatService: ChatService, private fb: FormBuilder, private socket: SocketService, private ngZone: NgZone) {
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

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      filter((term): term is string => typeof term === 'string'),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),
      switchMap(term => {
        if (term.length > 0) {
          // If the term is not empty, perform the search
          return this.chatService.searchUsers(term).pipe(
            catchError(() => of([])), // Return an empty array in case of error
            finalize(() => this.isSearching = false)
          );
        } else {
          // If the term is empty, return all users
          return this.chatService.getAllUsers().pipe(
            catchError(() => of([])), // Return an empty array in case of error
            finalize(() => this.isSearching = false)
          );
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(users => {
      this.users = users;
    });

    this.socket.listen<{ from: string }>('typing')
      .subscribe(({ from }) => {
        if (from === this.user2Data._id) {
          this.ngZone.run(() => this.isTyping = true);
        }
      });

    this.socket.listen<{ from: string }>('stopTyping')
      .subscribe(({ from }) => {
        if (from === this.user2Data._id) {
          this.ngZone.run(() => this.isTyping = false);
        }
      });
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
  }

  getAllUsers() {
    this.chatService.getAllUsers().subscribe({
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

    this.chatService.getPrivateMessages(user1, user2).subscribe({
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
    return user.image !== null ? user.image : 'public/images/chat-background.jpg';
  }

  getMe() {
    this.chatService.getMe().subscribe({
      next: (res: any) => {
        this.user1Data = res.user
        console.log('user1Data', this.user1Data);
      }
    })
  }

  sendMessage() {
    const text = this.chatForm.value.text.trim();
    if (!text) return;

    const timestamp = new Date();

    const payload = {
      senderId: this.user1Data._id,
      receiverId: this.user2Data._id,
      text,
      timestamp
    };
    // Emit via Socket.IO
    this.socket.emit('sendMessage', payload);
    // Persist via HTTP to your API
    this.chatService.sendMessage(payload.senderId, payload.receiverId, text, timestamp)
      .subscribe();

    this.chatForm.reset();
  }



  //ChatGpt

  typingTimeout?: any;

  notifyTyping() {
    clearTimeout(this.typingTimeout);
    console.log('EMIT typing ➤ to:', this.user2Data._id);
    this.socket.emit('typing', {
      to: this.user2Data._id,
      userId: this.user1Data._id
    });
    this.ngZone.run(() => console.log(this.isTyping)
    );
    this.typingTimeout = setTimeout(() => {
      console.log('EMIT stopTyping');
      this.socket.emit('stopTyping', {
        to: this.user2Data._id,
        userId: this.user1Data._id
      });
      this.ngZone.run(() => console.log(this.isTyping))
    }, 1500);
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
