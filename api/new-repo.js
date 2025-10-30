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

    if (req.headers['x-github-event'] !== 'repository' || payload.action !== 'created') {
      return res.status(200).json({ message: 'No action needed' });
    }

    const repoName = payload.repository?.name;
    const orgName = payload.repository?.owner?.login;

    if (!repoName || !orgName) {
      return res.status(400).json({ error: 'Missing repo or org name in payload' });
    }

    if (!process.env.VERCEL_TOKEN) {
      return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
    }

    const createResp = await fetch('https://api.vercel.com/v9/projects', {
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

    const projectData = await createResp.json();
    console.log('Project creation response:', projectData);

    if (!projectData.id) {
      return res.status(500).json({ error: 'Project creation failed', data: projectData });
    }

    const projectId = projectData.id;
    const subdomain = `${repoName}.lwhsftc.org`;

    // subdomain assignment 
    const domainResp = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: subdomain }),
    });

    const domainData = await domainResp.json();
    console.log('Domain assignment response:', domainData);

    res.status(200).json({ success: true, projectData, domainData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
