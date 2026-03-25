
const testPhrases = [
  "Analyze my load and plan my day for maximum focus",
  "Optimize my flow and reschedule missed objectives",
  "Give me a productivity boost tip",
  "Review my performance for this week"
];

testPhrases.forEach(phrase => {
  const msg = phrase.toLowerCase().trim();
  console.log(`--- Testing: "${msg}" ---`);

  let matched = "Fallback";

  // 0. QUICK COMMANDS
  if (msg.includes("plan my day") || msg.includes("analyze my load") || (msg.includes("plan") && msg.includes("day"))) {
     matched = "Plan Day";
  }
  else if (msg.includes("reschedule my missed") || msg.includes("optimize my flow")) {
     matched = "Optimize";
  }
  else if (msg.includes("productivity boost tip") || msg.includes("boost") || msg.includes("tip")) {
     matched = "Boost";
  }
  else if (msg.includes("weekly operational performance") || msg.includes("review my performance")) {
     matched = "Review";
  }
  
  // 1. NAVIGATION
  const navKeywords = ["go to", "open", "show", "navigate", "take me to", "switch to"];
  const isNav = navKeywords.some(k => msg.includes(k));
  if (matched === "Fallback" && isNav) {
    matched = "Navigation";
  }

  console.log(`Matched: ${matched}`);
});
