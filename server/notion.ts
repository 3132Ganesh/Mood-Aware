import axios from 'axios';

const notionVersion = '2022-06-28';

export async function logToNotion(
  token: string, 
  databaseId: string, 
  score: number, 
  emotions: string[] = [], 
  notes: string = ""
) {
  if (!token || !databaseId) return;

  const notion = axios.create({
    baseURL: 'https://api.notion.com/v1',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json'
    }
  });

  try {
    await notion.post('/pages', {
      parent: { database_id: databaseId },
      properties: {
        'Date': { date: { start: new Date().toISOString().split('T')[0] } },
        'Mood': { select: { name: score.toString() } },
        'Highlights': { rich_text: [{ text: { content: notes.substring(0, 2000) } }] },
        'Tags': { multi_select: emotions.map(e => ({ name: e })) }
      }
    });
  } catch (error: any) {
    console.error("Error logging to Notion:", error.response ? error.response.data : error.message);
  }
}

export async function fetchFromNotion(token: string, databaseId: string) {
  if (!token || !databaseId) return [];

  const notion = axios.create({
    baseURL: 'https://api.notion.com/v1',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json'
    }
  });

  try {
    const response = await notion.post(`/databases/${databaseId}/query`, {
      page_size: 5,
      sorts: [{ property: 'Date', direction: 'descending' }]
    });

    return response.data.results.map((page: any) => ({
      id: page.id,
      date: page.properties.Date?.date?.start || "",
      mood: page.properties.Mood?.select?.name || "",
      notes: page.properties.Highlights?.rich_text?.[0]?.plain_text || "",
      tags: page.properties.Tags?.multi_select?.map((t: any) => t.name) || []
    }));
  } catch (error: any) {
    console.error("Error fetching from Notion:", error.response ? error.response.data : error.message);
    return [];
  }
}
