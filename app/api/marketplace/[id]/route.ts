import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MarketplaceListing from '@/models/MarketplaceListing';
import UserCollection from '@/models/UserCollection';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/marketplace/[id] - Get a specific listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const listing = await MarketplaceListing.findById(params.id)
      .populate('userId', 'username email paymentInfo')
      .lean();

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

// PATCH /api/marketplace/[id] - Update a listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const listing = await MarketplaceListing.findById(params.id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if user owns this listing
    if (listing.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only update your own listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { pricePerCard, description, images, status } = body;

    // Update allowed fields
    if (pricePerCard !== undefined) listing.pricePerCard = pricePerCard;
    if (description !== undefined) listing.description = description;
    if (images !== undefined) listing.images = images;
    if (status !== undefined) {
      const oldStatus = listing.status;
      listing.status = status;

      // Handle quantity locking when status changes
      if (oldStatus === 'active' && (status === 'sold' || status === 'cancelled')) {
        // Unlock quantity in collection
        const userCollection = await UserCollection.findOne({ userId: user.userId });
        if (userCollection) {
          const collectionItem = userCollection.collection.find(
            (item: { card: { id: string } }) => item.card.id === listing.cardId
          );
          if (collectionItem) {
            collectionItem.lockedQuantity = Math.max(
              0,
              (collectionItem.lockedQuantity || 0) - listing.quantity
            );

            // If sold, reduce actual quantity
            if (status === 'sold') {
              collectionItem.quantity = Math.max(0, collectionItem.quantity - listing.quantity);
            }

            await userCollection.save();
          }
        }
      }
    }

    await listing.save();

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE /api/marketplace/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const listing = await MarketplaceListing.findById(params.id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if user owns this listing
    if (listing.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own listings' },
        { status: 403 }
      );
    }

    // Unlock quantity in collection if listing is active
    if (listing.status === 'active') {
      const userCollection = await UserCollection.findOne({ userId: user.userId });
      if (userCollection) {
        const collectionItem = userCollection.collection.find(
          (item: { card: { id: string } }) => item.card.id === listing.cardId
        );
        if (collectionItem) {
          collectionItem.lockedQuantity = Math.max(
            0,
            (collectionItem.lockedQuantity || 0) - listing.quantity
          );
          await userCollection.save();
        }
      }
    }

    await MarketplaceListing.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
