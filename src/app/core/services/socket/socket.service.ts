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
    console.log(userId);

  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable(observer => {
      const handler = (msg: T) => observer.next(msg);
      this.socket.on(event, handler);
      return () => this.socket.off(event, handler);
    });
  }

  // // Emit typing events
  // notifyTyping(roomId: string) {
  //   this.socket.emit('typing', { roomId, userId: this.socket.id });
  // }

  // // Emit stop typing events
  // stopTyping(roomId: string) {
  //   this.socket.emit('stopTyping', { roomId, userId: this.socket.id });
  // }
}
