// src/app/core/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {

  private socket: Socket;

  constructor() {
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString);
    const userData = userDataString ? JSON.parse(userDataString) : null;
    console.log(userData);
    const userId: any = userData?._id;
    this.socket = io('http://localhost:5000', {
      auth: { userId }
    });
    console.log(userId);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable(observer => {
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
}
