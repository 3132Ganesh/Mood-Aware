const moodentry={
    date:"2026-02-28",
    score:7,
    emotions:["motivated","excited","a little nervous"],
    notes:"day 1 of building my mood-aware App. feeling good!"
};
function printMoodSummary(entry){
    console.log("---------------------------------");
    console.log(`📅 Date: ${entry.date}`);
    console.log(`📈 Score: ${entry.score}`);
    console.log(`💭 Emotions:{entry.emotions.join(", ")}`);
    console.log(`📝 Notes:${entry.notes}`);
    console.log("---------------------------------");
}
printMoodSummary(moodentry);