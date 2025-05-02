
import React from 'react';
import { cn } from '@/lib/utils';

interface WordProps {
  word: string;
  userTyped: string;
  isActive: boolean;
}

const WordDisplay: React.FC<WordProps> = ({ word, userTyped, isActive }) => {
  // Calculate which characters are correct and which are errors
  const renderWord = () => {
    const chars = [];
    const minLength = Math.min(word.length, userTyped.length);
    
    // Process each character in the word
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const typedChar = userTyped[i] || '';
      
      // Determine the character's status
      let charClass = '';
      if (i < userTyped.length) {
        charClass = char === typedChar ? 'text-typeCorrect' : 'text-typeError';
      }
      
      chars.push(
        <span key={i} className={charClass}>
          {char}
        </span>
      );
    }
    
    // Add extra characters if user typed more than the word length
    if (userTyped.length > word.length) {
      for (let i = word.length; i < userTyped.length; i++) {
        chars.push(
          <span key={`extra-${i}`} className="text-typeError">
            {userTyped[i]}
          </span>
        );
      }
    }
    
    return chars;
  };
  
  return (
    <div 
      className={cn(
        "word", 
        isActive && "current"
      )}
    >
      {renderWord()}
    </div>
  );
};

interface WordsDisplayProps {
  words: string[];
  typedWords: string[];
  currentWordIndex: number;
}

const WordsDisplay: React.FC<WordsDisplayProps> = ({ 
  words, 
  typedWords,
  currentWordIndex
}) => {
  return (
    <div className="typing-container overflow-hidden">
      <div className="p-4 text-left min-h-[100px] overflow-auto font-mono tracking-wide">
        {words.map((word, index) => (
          <WordDisplay
            key={index}
            word={word}
            userTyped={typedWords[index] || ''}
            isActive={index === currentWordIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default WordsDisplay;
