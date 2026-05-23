require('dotenv').config();
const axios = require('axios');

async function getTodaysCount() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  const notion = axios.create({
    baseURL: 'https://api.notion.com/v1',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  });

  try {
    console.log(`Checking Notion schema...`);

    const response = await notion.post(`/databases/${databaseId}/query`);

    const tasks = response.data.results;
    console.log(`\n📋 ALL NOTION TASKS (${tasks.length})`);
    tasks.forEach(t => {
        const name = t.properties.Name.title.map(p => p.plain_text).join("");
        const date = t.properties.Date.date?.start || "No Date";
        const status = t.properties.Status.status.name;
        console.log(`  [${date}] [${status}] ${name}`);
    });

    // Also check for mood logs in the database if possible
    // But since I don't have the DATABASE_URL, I'll stick to Notion for now.

  } catch (error) {
    console.error("Error fetching from Notion:", error.response ? error.response.data : error.message);
  }
}

getTodaysCount();
