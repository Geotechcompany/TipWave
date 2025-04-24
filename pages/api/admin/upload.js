import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  // Check admin privileges
  if (!session) {
    return res.status(401).json({ error: "Unauthorized - No session" });
  }
  
  const isAdmin = 
    session.user.isAdmin === true || 
    session.user.role === "admin" || 
    session.user.role === "ADMIN" ||
    (session.user.permissions && session.user.permissions.includes("admin"));
  
  if (!isAdmin) {
    return res.status(401).json({ error: "Unauthorized - Not an admin" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming form data
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    return new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          return resolve(res.status(500).json({ error: 'Error processing upload' }));
        }

        // Get the uploaded file
        const file = files.image;
        if (!file || !file[0]) {
          return resolve(res.status(400).json({ error: 'No file uploaded' }));
        }

        // Check file mime type
        const uploadedFile = file[0];
        const mimeType = uploadedFile.mimetype;
        if (!mimeType.startsWith('image/')) {
          return resolve(res.status(400).json({ error: 'Only image files are allowed' }));
        }

        try {
          // Create the upload directory if it doesn't exist
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadDir, { recursive: true });

          // Generate a unique filename
          const fileExt = path.extname(uploadedFile.originalFilename || '');
          const fileName = `${uuidv4()}${fileExt}`;
          const filePath = path.join(uploadDir, fileName);

          // Read file from temp location
          const data = await fs.readFile(uploadedFile.filepath);
          
          // Write file to upload directory
          await fs.writeFile(filePath, data);
          
          // Return success with file path
          const relativePath = `/uploads/${fileName}`;
          return resolve(res.status(200).json({ 
            success: true, 
            imageUrl: relativePath 
          }));
        } catch (error) {
          console.error('Error processing file:', error);
          return resolve(res.status(500).json({ error: 'Error processing file' }));
        }
      });
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ error: 'Error handling upload' });
  }
} 