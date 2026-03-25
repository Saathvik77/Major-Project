console.log("Starting NLP Test...");
// Mock NLP logic extracted from aiController.js
const extractTime = (str) => {
  const timeMatch = str.match(/(?:at|for|by|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (!timeMatch) return { time: "09:00", text: str };
  
  let timeStr = timeMatch[1].toLowerCase();
  let [rawHrs, mins] = timeStr.replace(/am|pm/g, '').split(':');
  let hours = parseInt(rawHrs);
  mins = mins || "00";
  if (timeStr.includes("pm") && hours < 12) hours += 12;
  if (timeStr.includes("am") && hours === 12) hours = 0;
  
  const formattedTime = `${String(hours).padStart(2, '0')}:${mins.padStart(2, '0')}`;
  const remainingText = str.replace(timeMatch[0], "").trim();
  return { time: formattedTime, text: remainingText };
};

const testPhrases = [
  "Add a task to go to gym at 6pm",
  "Remind me to call Mom for 10 am",
  "Put Finish report on my list by 3:30 pm",
  "Delete gym",
  "Remove the meeting task",
  "Move gym to 7pm",
  "Navigate to analytics",
  "Take me to the dashboard",
  "Go to settings",
  "Show my tasks"
];

console.log("--- NLP TEST RESULTS ---");
testPhrases.forEach(phrase => {
  const msg = phrase.toLowerCase().trim();
  let action = "Unknown";
  let details = {};

  const navKeywords = ["go to", "open", "show", "navigate", "take me to", "switch to"];
  const isNav = navKeywords.some(k => msg.includes(k));

  if (isNav) {
    action = "Navigation";
    if (msg.includes("dashboard")) details.path = "/dashboard";
    else if (msg.includes("analytics")) details.path = "/analytics";
    else if (msg.includes("tasks")) details.path = "/tasks";
    else if (msg.includes("settings")) details.path = "/settings";
  } else if (msg.includes("delete") || msg.includes("remove")) {
    action = "Delete";
    details.title = msg.replace(/delete|remove|the task|task/g, "").trim();
  } else if (msg.includes("reschedule") || msg.includes("move")) {
    action = "Reschedule";
    const { time, text } = extractTime(msg);
    details.time = time;
    details.title = text.replace(/move|reschedule|to/g, "").trim();
  } else if (msg.includes("add") || msg.includes("create") || msg.includes("remind me") || msg.includes("put")) {
    action = "Create";
    const { time, text } = extractTime(msg);
    details.time = time;
    details.title = text.replace(/add a task to|add task to|create a task for|remind me to|put|on my list/g, "").trim();
  }

  console.log(`Phrase: "${phrase}"`);
  console.log(`Action: ${action}, Details: ${JSON.stringify(details)}`);
  console.log("------------------------");
});
