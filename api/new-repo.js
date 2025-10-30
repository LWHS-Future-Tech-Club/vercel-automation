export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  console.log('Function invoked');

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const payload = req.body;
    console.log('Payload:', payload);

    const repoName = payload.repository?.name;
    const orgName = payload.repository?.owner?.login;

    if (!repoName || !orgName) {
      return res.status(400).json({ error: 'Missing repo or org name in payload' });
    }

    if (!process.env.VERCEL_TOKEN) {
      return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
    }

    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        gitRepository: { type: 'github', repo: `${orgName}/${repoName}` },
      }),
    });

    const data = await response.json();
    console.log('Vercel response:', data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
