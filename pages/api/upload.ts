import type { NextApiRequest, NextApiResponse } from 'next';
import { fileStorage } from '@/lib/ai/handlers/fileUploadHandler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Upload API called');
    const { name, type, content } = req.body;

    if (!name || !type || !content) {
      console.error('Missing required fields:', { name, type, contentLength: content?.length });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Processing file upload:', { name, type, contentLength: content.length });
    
    // Store the file data directly
    const fileId = await fileStorage.uploadFile({ name, type, content });
    console.log('File uploaded to server storage:', { fileId, name, type });
    
    // Return the file ID
    res.status(200).json({ fileId });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      message: 'Error uploading file',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
