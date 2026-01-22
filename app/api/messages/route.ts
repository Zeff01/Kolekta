import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import MarketplaceListing from '@/models/MarketplaceListing';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/messages - Get messages for a listing or all user's message threads
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (listingId) {
      // Get messages for a specific listing
      const messages = await Message.find({ listingId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'username')
        .populate('receiverId', 'username')
        .lean();

      return NextResponse.json({ messages });
    } else {
      // Get all message threads for the user
      const messages = await Message.find({
        $or: [{ senderId: user.userId }, { receiverId: user.userId }],
      })
        .sort({ createdAt: -1 })
        .populate('senderId', 'username')
        .populate('receiverId', 'username')
        .populate('listingId')
        .lean();

      // Group messages by listing
      const threadsMap = new Map();
      for (const message of messages) {
        const listingIdStr = message.listingId?._id?.toString();
        if (!listingIdStr) continue;

        if (!threadsMap.has(listingIdStr)) {
          const otherUserId =
            message.senderId._id.toString() === user.userId
              ? message.receiverId._id
              : message.senderId._id;

          threadsMap.set(listingIdStr, {
            listingId: listingIdStr,
            listing: message.listingId,
            otherUser: {
              _id: otherUserId,
              username:
                message.senderId._id.toString() === user.userId
                  ? message.receiverId.username
                  : message.senderId.username,
            },
            messages: [],
            unreadCount: 0,
          });
        }

        const thread = threadsMap.get(listingIdStr);
        thread.messages.push(message);

        // Count unread messages received by the user
        if (
          message.receiverId._id.toString() === user.userId &&
          !message.read
        ) {
          thread.unreadCount++;
        }
      }

      const threads = Array.from(threadsMap.values());

      return NextResponse.json({ threads });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { listingId, receiverId, message, images } = body;

    if (!listingId || !receiverId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await MarketplaceListing.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Create message
    const newMessage = await Message.create({
      listingId,
      senderId: user.userId,
      receiverId,
      message,
      images,
      read: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'username')
      .populate('receiverId', 'username')
      .lean();

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
