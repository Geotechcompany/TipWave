import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('smtp_settings');

    if (req.method === 'GET') {
      // Get the settings without _id
      const settings = await collection.findOne(
        { type: 'smtp_config' },
        { projection: { _id: 0 } }
      );
      
      return res.status(200).json({ 
        settings: settings || {} 
      });
    }

    if (req.method === 'POST') {
      const incomingSettings = req.body;

      // Validate required fields if SMTP is enabled
      if (incomingSettings.isEnabled) {
        const requiredFields = ['host', 'port', 'user', 'password', 'from'];
        const missingFields = requiredFields.filter(field => !incomingSettings[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({ 
            error: `Missing required fields: ${missingFields.join(', ')}` 
          });
        }

        // Validate port number
        const port = parseInt(incomingSettings.port);
        if (isNaN(port) || port < 1 || port > 65535) {
          return res.status(400).json({ 
            error: 'Invalid port number' 
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(incomingSettings.from)) {
          return res.status(400).json({ 
            error: 'Invalid from email address format' 
          });
        }

        // Set secure based on port if not explicitly set
        if (incomingSettings.secure === undefined) {
          incomingSettings.secure = port === 465;
        }
      }

      // Extract all fields with defaults
      const {
        isEnabled = false,
        host = '',
        port = '',
        user = '',
        password = '',
        from = '',
        secure = false,
        ...otherSettings
      } = incomingSettings;

      // Update or insert SMTP settings
      await collection.updateOne(
        { type: 'smtp_config' },
        { 
          $set: { 
            isEnabled,
            host,
            port,
            user,
            password,
            from,
            secure,
            ...otherSettings,
            updatedAt: new Date(),
            type: 'smtp_config'
          } 
        },
        { upsert: true }
      );

      // Fetch updated settings without _id
      const updatedSettings = await collection.findOne(
        { type: 'smtp_config' },
        { projection: { _id: 0 } }
      );

      return res.status(200).json({ 
        success: true, 
        message: 'SMTP settings saved successfully',
        settings: updatedSettings
      });
    }
  } catch (error) {
    console.error('Error managing SMTP settings:', error);
    return res.status(500).json({ 
      error: 'Failed to manage SMTP settings',
      details: error.message 
    });
  }
} 