
import React from 'react';
import { UserChatBubble } from './UserChatBubble'
import { BotChatBubble } from './BotChatBubble';
import { BotThinking } from './BotThinking';
import { Greetings } from './Greetings';
import { ChatList } from '../../api/chats/types';

interface ChatHistoryProps {
    chatList: ChatList[],
    isTyping: boolean,
    streamedMessage: string,
}

export const ChatHistory = React.forwardRef<HTMLDivElement, ChatHistoryProps>(({ chatList, isTyping, streamedMessage }, ref) => {
    return(
        <div className="flex-1 scroll-hidden p-4 space-y-4 gap-4" ref={ref}>
            {chatList.length === 0 && !isTyping ? (
                <Greetings />
            ) : (
                <>
                    <div className="flex flex-col space-y-2">
                        {chatList.map((item, idx) =>
                            item.role === 'user' ? (
                                <UserChatBubble key={idx} message={item.message} files={item.files} />
                            ) : (
                                <BotChatBubble key={idx} message={item.message} />
                            )
                        )}
                        {isTyping && !streamedMessage && (<div className="p-1"><BotThinking /></div>)}
                        {/* <div className="p-1"><BotThinking /></div> */}
                        {streamedMessage && <BotChatBubble message={streamedMessage} />}
                    </div>
                </>
            )}
        </div>
    )
});


