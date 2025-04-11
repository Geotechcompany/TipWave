db.createCollection('activities');
db.activities.createIndex({ userId: 1, createdAt: -1 });

db.createCollection('events');
db.events.createIndex({ startDate: 1, status: 1 });

db.createCollection('notifications');
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 }); 