export interface Message {
  id: number;
  senderName: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string; // LocalDateTime kommt als ISO String
  isRead: boolean;
  invitation: boolean;
  groupId?: number;
}

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
}

export interface ChatMessageSendDTO {
  senderName: string;
  content: string;
}