// /api/new-repo.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const githubEvent = req.headers['x-github-event'];
  const payload = req.body;

  // Only respond to new repo creation
  if (githubEvent === 'repository' && payload.action === 'created') {
    const repoName = payload.repository.name;
    const orgName = payload.repository.owner.login;

    // Call Vercel API
    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        gitRepository: {
          type: 'github',
          repo: `${orgName}/${repoName}`
        }
      })
    });

    const data = await response.json();
    console.log('Vercel response:', data);
    return res.status(200).json({ success: true, data });
  }

  res.status(200).json({ success: true, message: 'No action taken' });
}
