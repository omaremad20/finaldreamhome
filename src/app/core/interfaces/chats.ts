export interface User1 {
  _id: string;
  email: string;
}
export interface Message {
  sender: User1;
  receiver: User1;
  message: string;
  timestamp: string;
  _id: string;
}
export interface Chat {
  _id: string;
  user1: {
    _id: string;
    email: string;
  };
  user2: {
    _id: string;
    email: string;
  };
  messages: {
    _id: string;
    message: string;
    sender: {
      _id: string;
      email: string;
    };
    receiver: {
      _id: string;
      email: string;
    };
    timestamp: string;
    seen: boolean;
  }[];
  updatedAt: string;
}
export interface ChatsResponse {
  chats: Chat[];
}
