import React, { useEffect, useRef } from "react";
import useCollection from "../../useCollection";
import useDocWithCache from "../../useDocWithCache";
import formatDate from "date-fns/format";
import isSameDay from "date-fns/is_same_day";

function ChatScroller(props) {
  const ref = useRef();
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (shouldScrollRef.current) {
      const node = ref.current;
      node.scrollTop = node.scrollHeight;
    }
  });

  const handleScroll = () => {
    const node = ref.current;
    const { scrollTop, clientHeight, scrollHeight } = node;
    const atBottom = scrollHeight === clientHeight + scrollTop;
    shouldScrollRef.current = atBottom;
  };

  return <div {...props} ref={ref} onScroll={handleScroll} />;
}

function Messages({ channelId }) {
  const messages = useCollection(`channels/${channelId}/messages`, "createdAt");

  return (
    <ChatScroller className="messages">
      <div className="EndOfMessages">That's every message!</div>
      {messages.map((message, idx) => {
        const previousMessage = messages[idx - 1];
        const showDay = shouldShowDay(previousMessage, message);
        const showAvatar = shouldShowAvatar(previousMessage, message);

        return showAvatar ? (
          <FirstMessageFromUser
            key={message.id}
            message={message}
            showDay={showDay}
          />
        ) : (
          <div key={message.id} className="Message no-avatar">
            <div className="MessageContent">{message.text}</div>
          </div>
        );
      })}
    </ChatScroller>
  );
}

function FirstMessageFromUser({ message, showDay }) {
  const author = useDocWithCache(message.user.path);

  return (
    <div key={message.id}>
      {showDay && (
        <div className="Day">
          <div className="DayLine1" />
          <div className="DayText">
            {new Date(message.createdAt.seconds * 1000).toLocaleDateString(
              "en-GB"
            )}
          </div>
          <div className="DayLine2" />
        </div>
      )}
      <div className="Message with-avatar">
        <div className="Avatar">
          <img
            src={author ? author.displayPhoto : ""}
            alt={author && author.displayPhoto}
          />
        </div>
        <div className="Author">
          <div>
            <span className="UserName">{author && author.displayName} </span>
            <span className="TimeStamp">
              {formatDate(message.createdAt.seconds * 1000, "h:mm A")}
            </span>
          </div>
          <div className="MessageContent">{message.text}</div>
        </div>
      </div>
    </div>
  );
}

function shouldShowDay(previous, message) {
  const isFirst = !previous;
  if (isFirst) {
    return true;
  }

  const isNewDay = !isSameDay(
    previous.createdAt.seconds * 1000,
    message.createdAt.seconds * 1000
  );

  return isNewDay;
}

function shouldShowAvatar(previous, message) {
  const isFirst = !previous;
  if (isFirst) {
    return true;
  }
  const differentUser = message.user.id !== previous.user.id;
  if (differentUser) {
    return true;
  }

  const hasBeenAWhile =
    message.createdAt.seconds - previous.createdAt.seconds > 180;

  return hasBeenAWhile;
}
export default Messages;
