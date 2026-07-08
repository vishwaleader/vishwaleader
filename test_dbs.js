const { GoogleAuth } = require('google-auth-library');

async function main() {
  const auth = new GoogleAuth({
    keyFile: 'firebase_admin_cred.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  const res = await client.request({
    url: 'https://firestore.googleapis.com/v1/projects/vishwaleader-techmedia/databases'
  });
  
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch(console.error);
