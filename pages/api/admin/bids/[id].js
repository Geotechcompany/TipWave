import { sendNotificationEmail, EmailTypes } from '@/lib/email';

// Inside the PUT method handler after updating bid status
if (req.method === 'PUT') {
  // After bid update is successful:
  
  // Get user email
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(bid.userId) });
  
  // Get song details
  const songsCollection = db.collection('songs');
  const song = await songsCollection.findOne({ _id: new ObjectId(bid.songId) });
  
  // Determine email type based on status
  let emailType = null;
  if (updatedBid.status === 'APPROVED') {
    emailType = EmailTypes.BID_APPROVED;
  } else if (updatedBid.status === 'REJECTED') {
    emailType = EmailTypes.BID_REJECTED;
  }
  
  // Send notification if status changed to approved or rejected
  if (emailType && user.email) {
    await sendNotificationEmail(emailType, user.email, {
      userName: user.name || user.email.split('@')[0],
      amount: bid.amount,
      songTitle: song.title
    });
  }
  
  // Continue with response
} 