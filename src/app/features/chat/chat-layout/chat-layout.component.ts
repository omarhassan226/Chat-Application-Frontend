import { AfterViewChecked, AfterViewInit, Component, ElementRef, NgZone, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChatService } from '../../../core/services/chat/chat.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketService } from '../../../core/services/socket/socket.service';
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, filter, finalize, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-chat-layout',
  standalone: false,
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ChatLayoutComponent implements AfterViewChecked {

  @ViewChild('messageContainer') msgContainer!: ElementRef;
  @ViewChildren('msgElem') messageElems!: QueryList<ElementRef>;

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
  showPicker: any = false
  selectedFile!: any
  private messageObserver!: IntersectionObserver;
  currentRoomId!: string;
  typingUsers = new Set<string>();


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

  ngAfterViewInit() {
    this.messageElems.changes.subscribe((qlist: QueryList<ElementRef>) => {
      qlist.forEach(el => this.messageObserver.observe(el.nativeElement));
    });
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
          console.log(this.isTyping);
          this.typingUsers.add(from);
        }
      });

    this.socket.listen<{ from: string }>('stopTyping')
      .subscribe(({ from }) => {
        if (from === this.user2Data._id) {
          this.ngZone.run(() => this.isTyping = false);
          console.log(this.isTyping);
          this.typingUsers.delete(from);
        }
      });

    this.messageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const msgId = entry.target.getAttribute('data-msg-id');
          const msg = this.privateMessages.find((m: any) => m._id === msgId);
          if (msg && !msg.isRead && msg.senderId === this.user2Data._id) {
            this.socket.emit('messageRead', {
              messageId: msg._id,
              readerId: this.user1Data._id
            });
          }
          this.messageObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.socket.listen<any>('messageSeen')
      .subscribe(({ messageId, seenBy, readAt }) => {
        const msg = this.privateMessages.find((m: any) => m._id === messageId);
        if (msg) {
          msg.isRead = true;
          msg.readAt = new Date(readAt);
        }
      });

    this.socket.listen<any>('receiveMessage').subscribe(msg => {
      if (msg.roomId === this.currentRoomId) {
        this.privateMessages.push(msg);
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





  // getUser(id: any) {
  //   const user = this.users.find((user: any) => user._id === id || user.id === id);
  //   this.user2Data = user
  //   console.log(this.user1Data);
  //   console.log(this.user2Data);

  //   this.getMe();

  //   this.getPrivateMessages(this.user1Data._id, this.user2Data._id)
  //   if (user) {
  //     console.log('Selected user:', user);
  //   } else {
  //     console.log('User not found');
  //   }
  // }

  getPrivateMessages() {
    console.log(this.user2Data._id);

    this.chatService.getPrivateMessages(this.user1Data._id, this.user2Data._id).subscribe({
      next: (res: any) => {
        this.privateMessages = res
        console.log('Private Messages:', this.privateMessages);
        this.socket.emit('joinRoom', { roomId: this.currentRoomId });
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

  //ChatGpt

  // sendMessage() {
  //   const text = this.chatForm.value.text || '';
  //   const file = this.selectedFile;

  //   // If both text and file are empty, do nothing

  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const payload = {
  //         metadata: {
  //           senderId: this.user1Data._id,
  //           receiverId: this.user2Data._id,
  //           text,
  //           filename: file.name,
  //           mimetype: file.type
  //         },
  //         buffer: reader.result as ArrayBuffer
  //       };
  //       console.log('📤 Emitting uploadMessage:', payload);
  //       this.socket.emit('uploadMessage', payload);
  //       this.resetForm();
  //       this.selectedFile = null
  //       console.log(this.privateMessages);

  //     };
  //     this.showPicker = false
  //     this.socket.emit('stopTyping', {
  //       to: this.user2Data._id,
  //       userId: this.user1Data._id
  //     });
  //     reader.readAsArrayBuffer(file);
  //   } else {
  //     const payload = {
  //       senderId: this.user1Data._id,
  //       receiverId: this.user2Data._id,
  //       text,
  //       timestamp: new Date()
  //     };
  //     console.log('📤 Emitting sendMessage:', payload);
  //     this.socket.emit('sendMessage', payload);
  //     this.resetForm();
  //     this.showPicker = false
  //     this.socket.emit('stopTyping', {
  //       to: this.user2Data._id,
  //       userId: this.user1Data._id
  //     });
  //   }
  // }

  extractFileNameWithoutNumbers(fileUrl: string): string {
    if (!fileUrl) return '';
    try {
      const url = new URL(fileUrl);
      const fileName = url.pathname.split('/').pop() || '';
      return fileName.replace(/\d+/g, '').replace(/[-_]+/g, ' ').trim();
    } catch {
      return fileUrl.split('/').pop()?.replace(/\d+/g, '').replace(/[-_]+/g, ' ').trim() || '';
    }
  }

  resetForm() {
    this.chatForm.reset();
    this.selectedFile = undefined;
  }
  typingTimeout?: any;

  notifyTyping() {
    clearTimeout(this.typingTimeout);
    console.log('EMIT typing ➤ to:', this.user2Data._id);
    this.socket.emit('typing', {
      to: this.user2Data._id,
      userId: this.user1Data._id
    });
    // this.ngZone.run(() => console.log(this.isTyping)
    // );
    this.typingTimeout = setTimeout(() => {
      console.log('EMIT stopTyping');
      this.socket.emit('stopTyping', {
        to: this.user2Data._id,
        userId: this.user1Data._id
      });
    }, 2000);
  }

  // بلوك
  blockUser(userId: string) {
    this.socket.emit('blockUser', { userId, by: this.user1Data._id });
    alert('User has been blocked!');
  }

  skintoneSetting(): 'both' | 'global' | 'individual' | 'none' {
    return 'both';
  }

  handleEmojiSelected(event: any) {
    const emoji = event.emoji;
    console.log(emoji);

    const currentText = this.chatForm.get('text')?.value || '';
    console.log(currentText);

    this.chatForm.patchValue({ text: currentText + emoji.value });
    // this.showPicker = false;
  }

  handleGlobalSkintoneChanged(event: any) {
    console.log('Global skin tone changed:', event.skinTone);
    // save user preference or update UI accordingly
  }

  showEmoji() {
    this.showPicker = !this.showPicker
    console.log(this.showEmoji);

  }

  storageConfig() {
    return {
      suggestionEmojis: {
        storage: 'localstorage',
        allowAutoSave: true
      },
      globalSkintone: {
        storage: 'localstorage',
        allowAutoSave: true
      },
      individualSkintones: {
        storage: 'localstorage',
        allowAutoSave: true
      }
    };
  }

  onFileSelect(e: Event) {
    this.selectedFile = (e.target as HTMLInputElement).files?.[0];
    console.log(this.selectedFile);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getUser(id: string) {
    const user = this.users.find((u: any) => u._id === id);
    this.user2Data = user!;
    this.chatService.createOrGetRoom([this.user1Data._id, id])
      .subscribe((res: any) => {
        console.log(res);

        this.currentRoomId = res.roomId;
        this.socket.joinRoom(this.currentRoomId);
        this.loadRoomMessages();
      });
  }

  loadRoomMessages() {
    this.chatService.getRoomMessages(this.currentRoomId)
      .subscribe(msgs => this.privateMessages = msgs);
  }

  sendMessage() {
    const text = this.chatForm.value.text;
    const file = this.selectedFile;
    if (!text && !file) return;

    const payload: any = {
      senderId: this.user1Data._id,
      roomId: this.currentRoomId,
      text,
      timestamp: new Date(),
    };
    this.socket.emit('stopTyping', {
      to: this.user2Data._id,
      userId: this.user1Data._id
    });

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        payload.metadata = {
          senderId: this.user1Data._id,
          roomId: this.currentRoomId,
          filename: file.name,
          mimetype: file.type,
          text,
          timestamp: new Date()
        };
        payload.buffer = reader.result as ArrayBuffer;
        this.socket.emit('uploadMessage', payload);
        this.socket.emit('stopTyping', {
          to: this.user2Data._id,
          userId: this.user1Data._id
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.socket.emit('sendMessage', payload);
      this.socket.emit('stopTyping', {
        to: this.user2Data._id,
        userId: this.user1Data._id
      });
    }

    this.resetForm();
  }


}
