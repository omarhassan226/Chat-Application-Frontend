import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatService } from '../chat/chat.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor(private chat: ChatService) {
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString);

    const userData = userDataString ? JSON.parse(userDataString) : null;
    console.log(userData);

    const userId: any = userData?._id;

    this.socket = io('http://localhost:5000', {
      auth: { userId },
    });
    console.log(userId);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      const handler = (msg: T) => observer.next(msg);
      this.socket.on(event, handler);
      return () => this.socket.off(event, handler);
    });
  }

  emit(event: string, data?: any, ack?: Function) {
    this.socket.emit(event, data, ack);
  }

  joinRoom(roomId: string) {
    this.emit('joinRoom', { roomId });
  }

  listenRoom<T>(event: string): Observable<T> {
    return this.listen<T>(event);
  }
}
