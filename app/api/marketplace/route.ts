import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MarketplaceListing from '@/models/MarketplaceListing';
import UserCollection from '@/models/UserCollection';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/marketplace - Get all active listings with filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const setId = searchParams.get('setId') || '';
    const condition = searchParams.get('condition') || '';
    const gradingStatus = searchParams.get('gradingStatus') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const userId = searchParams.get('userId') || ''; // For filtering by seller
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, price-low, price-high

    // Build query
    const query: Record<string, unknown> = { status: 'active' };

    if (search) {
      query['card.name'] = { $regex: search, $options: 'i' };
    }

    if (setId) {
      query['card.set.id'] = setId;
    }

    if (condition) {
      query.condition = condition;
    }

    if (gradingStatus) {
      query.gradingStatus = gradingStatus;
    }

    if (minPrice || maxPrice) {
      query.pricePerCard = {};
      if (minPrice) query.pricePerCard.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerCard.$lte = parseFloat(maxPrice);
    }

    if (userId) {
      query.userId = userId;
    }

    // Build sort
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === 'price-low') {
      sort = { pricePerCard: 1 };
    } else if (sortBy === 'price-high') {
      sort = { pricePerCard: -1 };
    }

    const listings = await MarketplaceListing.find(query)
      .sort(sort)
      .populate('userId', 'username email')
      .lean();

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace listings' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      cardId,
      card,
      quantity,
      pricePerCard,
      condition,
      gradingStatus,
      grading,
      description,
      images,
    } = body;

    // Validate required fields
    if (!cardId || !card || !quantity || !pricePerCard || !condition || !gradingStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has enough quantity in collection
    const userCollection = await UserCollection.findOne({ userId: user.userId });

    if (!userCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const collectionItem = userCollection.collection.find(
      (item: { card: { id: string } }) => item.card.id === cardId
    );

    if (!collectionItem) {
      return NextResponse.json(
        { error: 'Card not found in collection' },
        { status: 404 }
      );
    }

    const availableQuantity = collectionItem.quantity - (collectionItem.lockedQuantity || 0);
    if (availableQuantity < quantity) {
      return NextResponse.json(
        { error: `Only ${availableQuantity} available to list` },
        { status: 400 }
      );
    }

    // Create listing
    const listing = await MarketplaceListing.create({
      userId: user.userId,
      cardId,
      card,
      quantity,
      pricePerCard,
      condition,
      gradingStatus,
      grading: gradingStatus === 'graded' ? grading : undefined,
      description,
      images,
      status: 'active',
    });

    // Lock quantity in collection
    collectionItem.lockedQuantity = (collectionItem.lockedQuantity || 0) + quantity;
    await userCollection.save();

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating marketplace listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
