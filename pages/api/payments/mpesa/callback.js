import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // M-Pesa sends the callback as a POST request with payment details
    const callbackData = req.body;
    const { Body } = callbackData;
    
    // Log the callback data for debugging
    console.log('M-Pesa Callback Data:', JSON.stringify(callbackData, null, 2));
    
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ error: 'Invalid callback data' });
    }
    
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
    
    const client = await clientPromise;
    const db = client.db();
    
    // Find the pending transaction
    const pendingTx = await db.collection('pendingTransactions').findOne({
      checkoutRequestId: CheckoutRequestID
    });
    
    if (!pendingTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // If payment was successful
    if (ResultCode === 0) {
      // Extract payment details from metadata
      const metadataItems = CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = metadataItems.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadataItems.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadataItems.find(item => item.Name === 'PhoneNumber')?.Value;
      const amount = metadataItems.find(item => item.Name === 'Amount')?.Value;
      
      // Start a session for the transaction
      const mongoSession = client.startSession();
      
      try {
        mongoSession.startTransaction();
        
        // Create a transaction record
        await db.collection('transactions').insertOne({
          userId: pendingTx.userId,
          type: 'topup',
          amount: amount || pendingTx.amount,
          currency: pendingTx.currency,
          paymentMethod: 'mpesa',
          mpesaReceiptNumber,
          phoneNumber: phoneNumber || pendingTx.phone,
          status: 'COMPLETED',
          description: `M-Pesa top-up`,
          details: {
            checkoutRequestId: CheckoutRequestID,
            mpesaReceiptNumber,
            transactionDate
          },
          createdAt: new Date()
        }, { session: mongoSession });
        
        // Update user's wallet balance
        await db.collection('wallets').updateOne(
          { userId: pendingTx.userId },
          { 
            $inc: { balance: Number(amount || pendingTx.amount) },
            $set: { updatedAt: new Date() }
          },
          { 
            session: mongoSession,
            upsert: true
          }
        );
        
        // Update pending transaction status
        await db.collection('pendingTransactions').updateOne(
          { checkoutRequestId: CheckoutRequestID },
          { 
            $set: { 
              status: 'completed',
              mpesaReceiptNumber,
              completedAt: new Date()
            } 
          },
          { session: mongoSession }
        );
        
        await mongoSession.commitTransaction();
      } catch (error) {
        await mongoSession.abortTransaction();
        console.error('Error processing M-Pesa callback:', error);
        throw error;
      } finally {
        await mongoSession.endSession();
      }
    } else {
      // Payment failed, update the pending transaction
      await db.collection('pendingTransactions').updateOne(
        { checkoutRequestId: CheckoutRequestID },
        { 
          $set: { 
            status: 'failed',
            failureReason: ResultDesc,
            completedAt: new Date()
          } 
        }
      );
    }
    
    // Always respond with success to M-Pesa
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling M-Pesa callback:', error);
    // Still respond with success to M-Pesa to prevent retries
    res.status(200).json({ success: true });
  }
} 