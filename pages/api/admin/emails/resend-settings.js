import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('resend_settings');

    if (req.method === 'GET') {
      // Get the settings without _id
      const settings = await collection.findOne(
        { type: 'resend_config' },
        { projection: { _id: 0 } }
      );
      
      return res.status(200).json({ 
        settings: settings || {} 
      });
    }

    if (req.method === 'POST') {
      const incomingSettings = req.body;

      // Validate required fields if Resend is enabled
      if (incomingSettings.isEnabled) {
        const requiredFields = ['apiKey', 'fromEmail'];
        const missingFields = requiredFields.filter(field => !incomingSettings[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({ 
            error: `Missing required fields: ${missingFields.join(', ')}` 
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(incomingSettings.fromEmail)) {
          return res.status(400).json({ 
            error: 'Invalid from email address format' 
          });
        }
      }

      // Extract all fields except _id
      const { 
        isEnabled = false,
        apiKey = '',
        fromEmail = '',
        ...otherSettings
      } = incomingSettings;

      // Update or insert Resend settings
      await collection.updateOne(
        { type: 'resend_config' },
        { 
          $set: { 
            isEnabled,
            apiKey,
            fromEmail,
            ...otherSettings,
            updatedAt: new Date(),
            type: 'resend_config'
          } 
        },
        { upsert: true }
      );

      // Fetch updated settings without _id
      const updatedSettings = await collection.findOne(
        { type: 'resend_config' },
        { projection: { _id: 0 } }
      );

      return res.status(200).json({ 
        success: true, 
        message: 'Resend settings saved successfully',
        settings: updatedSettings
      });
    }
  } catch (error) {
    console.error('Error managing Resend settings:', error);
    return res.status(500).json({ 
      error: 'Failed to manage Resend settings',
      details: error.message 
    });
  }
} 