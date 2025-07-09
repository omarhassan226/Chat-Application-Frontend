import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timestamp } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';

export interface User { /* id, username, email, phone, image, ... */ }
export interface ChatRoom { /* _id, name, members */ }
export interface Message { /* _id, senderId, receiverId, ... */ }

@Injectable({ providedIn: 'root' })
export class ChatService {
  private base = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) { }

  private handleErr(err: any) {
    console.error('API Error:', err);
    return throwError(() => err);
  }

  // --- Users ---
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`).pipe(catchError(this.handleErr));
  }

  searchUsers(q: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users-filter`, { params: new HttpParams().set('q', q) })
      .pipe(catchError(this.handleErr));
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.base}/me`).pipe(catchError(this.handleErr));
  }

  blockUser(targetUserId: string): Observable<any> {
    return this.http.post(`${this.base}/block`, { targetUserId }).pipe(catchError(this.handleErr));
  }

  unblockUser(targetUserId: string): Observable<any> {
    return this.http.post(`${this.base}/unblock`, { targetUserId }).pipe(catchError(this.handleErr));
  }

  // --- Rooms ---
  createRoom(name: string, members: string[]): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.base}/create-room`, { name, members })
      .pipe(catchError(this.handleErr));
  }

  // --- Messages ---
  sendMessage(senderId: string, receiverId?: string, text?: string, timStamp?: any, roomId?: string)
    : Observable<Message> {
    const body: any = { senderId, text, timestamp };
    if (receiverId) body.receiverId = receiverId;
    if (roomId) body.roomId = roomId;
    return this.http.post<Message>(`${this.base}/send`, body).pipe(catchError(this.handleErr));
  }

  sendFile(file: File, receiverId?: string, text?: string, roomId?: string): Observable<Message> {
    const fd = new FormData();
    if (file) fd.append('file', file);
    if (receiverId) fd.append('receiverId', receiverId);
    if (roomId) fd.append('roomId', roomId);
    if (text) fd.append('text', text);
    return this.http.post<Message>(`${this.base}/send-file`, fd).pipe(catchError(this.handleErr));
  }

  getRoomMessages(roomId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/room/${roomId}/messages`)
      .pipe(catchError(this.handleErr));
  }

  getPrivateMessages(user1: string, user2: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/private/${user1}/${user2}`)
      .pipe(catchError(this.handleErr));
  }

  markRead(messageIds: string[]): Observable<any> {
    return this.http.post(`${this.base}/mark-read`, { messageIds }).pipe(catchError(this.handleErr));
  }

  getRecentPrivate(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/private/recent`).pipe(catchError(this.handleErr));
  }

  getRecentGroup(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/group/recent`).pipe(catchError(this.handleErr));
  }
}
