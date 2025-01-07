// TypingAnimation.js
import React, { useEffect, useState } from "react";

const TypingAnimation = ({ words }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let typingTimeout;

    const handleTyping = () => {
      const currentWord = words[loopNum % words.length];
      setDisplayedText(
        isDeleting
          ? currentWord.substring(0, displayedText.length - 1)
          : currentWord.substring(0, displayedText.length + 1)
      );

      setTypingSpeed(isDeleting ? 100 : 150);

      if (!isDeleting && displayedText === currentWord) {
        setTypingSpeed(1000);
        setIsDeleting(true);
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      }

      typingTimeout = setTimeout(handleTyping, typingSpeed);
    };

    typingTimeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(typingTimeout);
  }, [displayedText, isDeleting, typingSpeed, words, loopNum]);

  return (
    <div className="typing-animation">
      <span>{displayedText}</span>
      <span className="cursor">|</span>
    </div>
  );
};

export default TypingAnimation;
