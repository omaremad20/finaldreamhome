import { Pipe, PipeTransform } from '@angular/core';
import { Chat } from '../../../core/interfaces/chats';

@Pipe({
  name: 'chatSearch'
})
export class ChatSearchPipe implements PipeTransform {

  transform(chats: Chat[], searchText: string): any[] {
    if (!chats || !searchText) {
      return chats;
    }

    searchText = searchText.toLowerCase();

    return chats.filter(chat => {
      // Search in user1 email
      const user1Email = chat.user1.email.toLowerCase();
      const user1Matches = user1Email.includes(searchText);

      // Search in user2 email
      const user2Email = chat.user2.email.toLowerCase();
      const user2Matches = user2Email.includes(searchText);

      // Search in messages
      const messageMatches = chat.messages.some(msg =>
        msg.message?.toLowerCase().includes(searchText)
      );

      // Return true if any of the search criteria match
      return user1Matches || user2Matches || messageMatches;
    });
  }

}
