import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance (for use in React components)
export const getPusherClient = () => {
  if (typeof window === 'undefined') {
    return null
  }
  
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  })
}

// Channel names
export const CHANNELS = {
  BOOKING: (bookingId: string) => `private-booking-${bookingId}`,
  DRIVER: (driverId: string) => `private-driver-${driverId}`,
  CUSTOMER: (customerId: string) => `private-customer-${customerId}`,
  ADMIN: 'private-admin',
  TRACKING: (bookingId: string) => `presence-tracking-${bookingId}`,
  GLOBAL: 'public-updates',
}

// Event names
export const EVENTS = {
  // Booking events
  BOOKING_CREATED: 'booking:created',
  BOOKING_ACCEPTED: 'booking:accepted',
  BOOKING_STARTED: 'booking:started',
  BOOKING_COMPLETED: 'booking:completed',
  BOOKING_CANCELLED: 'booking:cancelled',
  
  // Driver events
  DRIVER_ONLINE: 'driver:online',
  DRIVER_OFFLINE: 'driver:offline',
  DRIVER_LOCATION_UPDATE: 'driver:location-update',
  DRIVER_ASSIGNED: 'driver:assigned',
  
  // Payment events
  PAYMENT_RECEIVED: 'payment:received',
  PAYMENT_FAILED: 'payment:failed',
  PAYMENT_REFUNDED: 'payment:refunded',
  
  // Chat events
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
}

// Trigger event helper
export async function triggerEvent(
  channel: string,
  event: string,
  data: any
) {
  try {
    await pusherServer.trigger(channel, event, data)
  } catch (error) {
    console.error('Error triggering Pusher event:', error)
    throw error
  }
}

// Batch trigger helper
export async function triggerBatchEvents(
  events: Array<{
    channel: string
    name: string
    data: any
  }>
) {
  try {
    await pusherServer.triggerBatch(events)
  } catch (error) {
    console.error('Error triggering batch Pusher events:', error)
    throw error
  }
}

// Authenticate user for private channels
export async function authenticateUser(
  socketId: string,
  channel: string,
  userId: string
) {
  try {
    const auth = pusherServer.authorizeChannel(socketId, channel, {
      user_id: userId,
      user_info: {
        id: userId,
      },
    })
    return auth
  } catch (error) {
    console.error('Error authenticating Pusher user:', error)
    throw error
  }
}

// Get channel info
export async function getChannelInfo(channel: string) {
  try {
    const response = await pusherServer.get({
      path: `/channels/${channel}`,
    })
    return response
  } catch (error) {
    console.error('Error getting channel info:', error)
    throw error
  }
}

// Get presence channel users
export async function getPresenceUsers(channel: string) {
  try {
    const response = await pusherServer.get({
      path: `/channels/${channel}/users`,
    })
    return response
  } catch (error) {
    console.error('Error getting presence users:', error)
    throw error
  }
}
