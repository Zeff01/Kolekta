import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import UserCollection from '@/models/UserCollection';

// GET - Fetch user's collection
export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let userCollection = await UserCollection.findOne({ userId: userPayload.userId });

    if (!userCollection) {
      // Create empty collection if it doesn't exist
      userCollection = new UserCollection({
        userId: userPayload.userId,
        collection: [],
        wishlist: [],
      });
      await userCollection.save();
    }

    return NextResponse.json({
      collection: userCollection.collection,
      wishlist: userCollection.wishlist,
    });
  } catch (error) {
    console.error('Get collection error:', error);
    return NextResponse.json(
      { error: 'Failed to get collection' },
      { status: 500 }
    );
  }
}

// POST - Update user's collection and wishlist
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { collection, wishlist } = await request.json();

    await connectToDatabase();

    let userCollection = await UserCollection.findOne({ userId: userPayload.userId });

    if (!userCollection) {
      userCollection = new UserCollection({
        userId: userPayload.userId,
        collection: collection || [],
        wishlist: wishlist || [],
      });
    } else {
      if (collection !== undefined) {
        userCollection.collection = collection;
      }
      if (wishlist !== undefined) {
        userCollection.wishlist = wishlist;
      }
    }

    await userCollection.save();

    return NextResponse.json({
      collection: userCollection.collection,
      wishlist: userCollection.wishlist,
    });
  } catch (error) {
    console.error('Update collection error:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}
