export default function handler(req, res) {
  console.log('Function invoked!');
  
  if (req.method === 'POST') {
    console.log('Payload:', req.body);
    res.status(200).json({ success: true, message: 'Function is working!' });
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
