export interface GroupBook {
  bookId: string;
  title: string;
  authors: string[];
  publishedDate?: string;
  language?: string;
  reviewCount: number;
  groupRatings: {
    stars: number;
    quality: number;
    fetish: number;
    cover: number;
  };
  myRatings?: {
    stars: number;
    quality: number;
    fetish: number;
    cover: number;
  };
  myComment?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  isAdmin: boolean;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestDate: string;
  message: string;
}

export interface GroupChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface BookGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  bookCount: number;
  createdDate: string;
  joined: boolean;
  isPrivate: boolean;
  books: GroupBook[];
  ownerId?: string;
  members?: GroupMember[];
  joinRequests?: JoinRequest[];
  chatMessages?: GroupChatMessage[];
}