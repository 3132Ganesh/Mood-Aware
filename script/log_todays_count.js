require('dotenv').config();
const axios = require('axios');

async function logCount() {
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
    const today = new Date().toISOString().split('T')[0];
    const taskName = "today count: 254 has passed";

    console.log(`Logging to Notion: "${taskName}" for ${today}`);

    const response = await notion.post('/pages', {
      parent: { database_id: databaseId },
      properties: {
        'Name': {
          title: [{ text: { content: taskName } }]
        },
        'Date': {
          date: { start: today }
        },
        'Status': {
          status: { name: 'Done' }
        }
      }
    });

    console.log(`✅ Successfully logged to Notion! Page ID: ${response.data.id}`);

  } catch (error) {
    console.error("Error logging to Notion:", error.response ? error.response.data : error.message);
  }
}

logCount();
