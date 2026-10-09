require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { sendNotification } = require('./fcm');

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Initialize Supabase Client (using Service Role for backend access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log("SafeRide AI Notification Dispatcher (Agent 5) started...");
console.log("Listening for real-time transit_events from Supabase...");

// Helper function to fetch Parent's FCM Token and Student info
async function getParentInfoForStudent(studentId) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        first_name,
        last_name,
        users!students_parent_id_fkey (
          full_name,
          fcm_token
        )
      `)
      .eq('id', studentId)
      .single();

    if (error) throw error;
    
    // Extract parent token assuming 'users' table has 'fcm_token' column
    const fcmToken = data.users?.fcm_token;
    return {
      studentName: data.first_name,
      parentToken: fcmToken
    };
  } catch (error) {
    console.error(`Error fetching parent info for student ${studentId}:`, error.message);
    return null;
  }
}

// Helper function to fetch Bus details
async function getBusInfo(busId) {
  try {
    const { data, error } = await supabase
      .from('buses')
      .select('bus_number')
      .eq('id', busId)
      .single();
    
    if (error) throw error;
    return data.bus_number;
  } catch (error) {
    console.error(`Error fetching bus info for bus ${busId}:`, error.message);
    return "Unknown Bus";
  }
}

// Main Realtime Subscription to `transit_events`
supabase
  .channel('public:transit_events')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'transit_events' },
    async (payload) => {
      const event = payload.new;
      console.log(`\nNew Transit Event Detected: ${event.event_type} for Student: ${event.student_id}`);

      // 1. Fetch related data (Student Name, Parent FCM Token, Bus Number)
      const parentInfo = await getParentInfoForStudent(event.student_id);
      const busNumber = await getBusInfo(event.bus_id);

      if (!parentInfo || !parentInfo.parentToken) {
        console.warn(`Cannot send notification: Missing FCM token for student ${event.student_id}.`);
        return;
      }

      const { studentName, parentToken } = parentInfo;
      const timestamp = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 2. Construct Notification based on Event Type
      let title = '';
      let body = '';
      const dataPayload = {
        event_type: event.event_type,
        student_id: event.student_id,
        timestamp: event.created_at
      };

      switch (event.event_type) {
        case 'GEOFENCE_ARRIVAL':
          title = 'Bus Arrived 🚌';
          body = `${busNumber} has arrived at ${studentName}'s pickup location.`;
          break;
        case 'BOARDING_VERIFIED':
          title = 'Boarding Confirmed ✅';
          body = `${studentName} has safely boarded ${busNumber} at ${timestamp}.`;
          break;
        case 'DROP_OFF_VERIFIED':
          title = 'Drop-Off Confirmed 📍';
          body = `${studentName} was dropped off by ${busNumber} at ${timestamp}.`;
          break;
        case 'BOARDING_MANUAL_OVERRIDE':
          title = 'Boarding Confirmed (Manual) ⚠️';
          body = `${studentName} was manually checked into ${busNumber} at ${timestamp}. Reason: ${event.override_reason || 'Not specified'}`;
          break;
        case 'MISMATCH_FLAGGED':
          console.log(`Mismatch flagged for ${studentName}, no parent notification sent by default to prevent panic. Logging for admin.`);
          return; // Don't notify parent for internal mismatch flags immediately
        default:
          console.warn(`Unhandled event type: ${event.event_type}`);
          return;
      }

      // 3. Dispatch Push Notification via FCM
      console.log(`Dispatching Push Notification: "${title}" to Parent Token...`);
      await sendNotification(parentToken, title, body, dataPayload);

      // 4. Broadcast live WebSocket event feed to Agent 1's Next.js admin dashboard
      console.log(`Broadcasting event to Admin Dashboard...`);
      await supabase
        .channel('admin_dashboard_feed')
        .send({
          type: 'broadcast',
          event: 'live_transit_update',
          payload: {
            ...dataPayload,
            student_name: studentName,
            bus_number: busNumber,
            title,
            body
          },
        });
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to transit_events insertions.');
    } else {
      console.log('Supabase subscription status:', status);
    }
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log("Shutting down Agent 5 Notification Dispatcher...");
  await supabase.removeAllChannels();
  process.exit(0);
});
