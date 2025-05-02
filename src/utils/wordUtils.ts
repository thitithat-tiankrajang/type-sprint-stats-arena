
// Common English words for typing tests (200 common words)
const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", 
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", 
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", 
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", 
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", 
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", 
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "are", "was", "were", "been", "has", "had", "did", "done", "should",
  "would", "could", "might", "must", "shall", "will", "may", "can", "let", "more",
  "much", "here", "there", "such", "right", "left", "down", "through", "before", "again",
  "many", "few", "those", "each", "while", "both", "between", "among", "around", "without",
  "another", "against", "along", "away", "across", "behind", "beyond", "during", "except", "inside",
  "outside", "under", "above", "below", "within", "throughout", "together", "already", "still", "though",
  "although", "since", "until", "whether", "whoever", "whatever", "whenever", "wherever", "however", "whichever",
  "neither", "either", "certainly", "definitely", "probably", "possibly", "clearly", "obviously", "actually", "really",
  "always", "sometimes", "never", "often", "usually", "rarely", "seldom", "quickly", "slowly", "carefully"
];

// Function to generate a set of random words
export const generateWords = (count: number = 50): string[] => {
  const words: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    words.push(commonWords[randomIndex]);
  }
  
  return words;
};

// Function to calculate word accuracy
export const calculateAccuracy = (
  typedWord: string,
  targetWord: string
): number => {
  // Count correct characters
  let correctChars = 0;
  const minLength = Math.min(typedWord.length, targetWord.length);
  
  for (let i = 0; i < minLength; i++) {
    if (typedWord[i] === targetWord[i]) {
      correctChars++;
    }
  }
  
  // Calculate accuracy as percentage of correct characters
  const totalChars = targetWord.length;
  return totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
};
