// src/app/core/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatService } from '../chat/chat.service';

@Injectable({ providedIn: 'root' })
export class SocketService {

  private socket: Socket;

  constructor(private chat: ChatService) {
    // const userId = this.chat.userData;
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString);

    const userData = userDataString ? JSON.parse(userDataString) : null;
    console.log(userData);

    const userId: any = userData?._id;
    // console.log(userData);
    // const userId = 1

    this.socket = io('http://localhost:5000', {
      auth: { userId }
    });
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable(observer => {
      this.socket.on(event, (msg: T) => observer.next(msg));
    });
  }
}
