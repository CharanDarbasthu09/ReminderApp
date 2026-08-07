const FALLBACK_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
];

export async function fetchQuoteOfTheDay() {
  try {
    const response = await fetch('https://dummyjson.com/quotes/random', {
      headers: { 'Accept': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.quote) {
        return {
          text: data.quote,
          author: data.author || 'Unknown',
        };
      }
    }
  } catch (error) {
    console.log('Error fetching online quote, using fallback:', error);
  }

  // Fallback random quote
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[randomIndex];
}
