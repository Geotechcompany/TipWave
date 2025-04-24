import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  // Modified authentication check to handle different admin role structures
  if (!session) {
    return res.status(401).json({ error: "Unauthorized - No session" });
  }
  
  // Check for admin privileges using different possible structures
  const isAdmin = 
    session.user.isAdmin === true || 
    session.user.role === "admin" || 
    session.user.role === "ADMIN" ||
    (session.user.permissions && session.user.permissions.includes("admin"));
  
  if (!isAdmin) {
    // Log for debugging
    console.log("User lacks admin privileges:", session.user);
    return res.status(401).json({ error: "Unauthorized - Not an admin" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the range parameter from the query
    const { range = "week" } = req.query;
    
    // Connect to the database and fetch real data
    const data = await fetchRevenueDataFromDatabase(range);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return res.status(500).json({ error: "Failed to fetch revenue data" });
  }
}

async function fetchRevenueDataFromDatabase(range) {
  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db();
  
  // Set the date range based on the requested range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case "month":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "quarter":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default: // week
      startDate.setDate(startDate.getDate() - 7);
  }
  
  // Query transactions or song_requests with completed status
  // Adjust the collection name and fields based on your actual schema
  const revenueData = await db.collection('song_requests')
    .aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: "completed" // Or whatever indicates a successful transaction
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray();
  
  // Format the data to match the expected structure
  const formattedRevenueByDay = [];
  
  // Create a map of all days in the range (including days with zero revenue)
  const dayMap = {};
  const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i <= dayDiff; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    const dayName = dateStr === new Date().toISOString().split('T')[0] 
      ? "Today" 
      : range === "year" || range === "quarter"
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { weekday: "short" });
    
    dayMap[dateStr] = {
      day: dayName,
      date: dateStr,
      amount: 0 // Default to zero
    };
  }
  
  // Fill in the actual revenue data
  revenueData.forEach(item => {
    if (dayMap[item._id]) {
      dayMap[item._id].amount = item.amount;
    }
  });
  
  // Convert the map to an array
  for (const dateStr in dayMap) {
    formattedRevenueByDay.push(dayMap[dateStr]);
  }
  
  // Sort by date
  formattedRevenueByDay.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate total and average
  const totalRevenue = formattedRevenueByDay.reduce((sum, item) => sum + item.amount, 0);
  const avgRevenue = Math.floor(totalRevenue / formattedRevenueByDay.length) || 0;
  
  // If no data is found, use the mock generator as fallback (for development)
  if (formattedRevenueByDay.length === 0) {
    console.warn("No revenue data found in database, using mock data instead");
    return generateMockRevenueData(range);
  }
  
  return {
    revenueByDay: formattedRevenueByDay,
    totalRevenue,
    avgRevenue,
    startDate: formattedRevenueByDay[0]?.date || startDate.toISOString().split('T')[0],
    endDate: formattedRevenueByDay[formattedRevenueByDay.length - 1]?.date || endDate.toISOString().split('T')[0]
  };
}

// Keep the mock data generator as a fallback
function generateMockRevenueData(range) {
  const today = new Date();
  let days = 7;
  let multiplier = 1;
  
  switch (range) {
    case "month":
      days = 30;
      multiplier = 0.8;
      break;
    case "quarter":
      days = 90;
      multiplier = 0.6;
      break;
    case "year":
      days = 365;
      multiplier = 0.4;
      break;
    default: // week
      days = 7;
      multiplier = 1;
  }
  
  const revenueByDay = [];
  
  // Generate data points
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i - 1));
    
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Create a somewhat realistic pattern with some randomness
    let baseAmount = Math.floor(Math.random() * 4000) + 3000;
    
    // Weekends have more revenue
    if (date.getDay() === 0 || date.getDay() === 6) {
      baseAmount *= 1.5;
    }
    
    // Scale based on range
    baseAmount = Math.floor(baseAmount * multiplier);
    
    // Apply a trend that increases over time
    const trendFactor = 1 + (i / days * 0.2);
    const amount = Math.floor(baseAmount * trendFactor);
    
    revenueByDay.push({
      day: days <= 31 ? dayName : monthDay,
      date: date.toISOString().split('T')[0],
      amount
    });
  }
  
  // Calculate total and other metrics
  const totalRevenue = revenueByDay.reduce((sum, item) => sum + item.amount, 0);
  const avgRevenue = Math.floor(totalRevenue / days);
  
  return {
    revenueByDay,
    totalRevenue,
    avgRevenue,
    startDate: revenueByDay[0].date,
    endDate: revenueByDay[revenueByDay.length - 1].date
  };
} 