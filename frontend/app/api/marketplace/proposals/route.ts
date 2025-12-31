import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// GET - Fetch proposals for a listing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');
    const freelancerAddress = searchParams.get('freelancerAddress');

    if (listingId) {
      // Get all proposals for a listing
      const listing = await kv.get(listingId);
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        proposals: (listing as any).proposals || []
      });
    }

    if (freelancerAddress) {
      // Get all proposals by a freelancer
      const proposalKeys = await kv.keys(`proposal:${freelancerAddress}:*`);
      const proposals = await Promise.all(
        proposalKeys.map(async (key) => await kv.get(key))
      );

      return NextResponse.json({
        proposals
      });
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

// POST - Submit new proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, proposal } = body;

    if (!listingId || !proposal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get listing
    const listing = await kv.get(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Add proposal to listing
    const updatedListing = {
      ...listing,
      proposals: [...((listing as any).proposals || []), proposal]
    };

    await kv.set(listingId, updatedListing);

    // Store proposal reference for freelancer
    const proposalId = `proposal:${proposal.freelancerAddress}:${Date.now()}`;
    await kv.set(proposalId, {
      ...proposal,
      listingId,
      proposalId
    });

    return NextResponse.json({
      success: true,
      proposalId
    });
  } catch (error) {
    console.error('Failed to submit proposal:', error);
    return NextResponse.json(
      { error: 'Failed to submit proposal' },
      { status: 500 }
    );
  }
}

// PATCH - Update proposal status (accept/reject)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, proposalId, status, clientAddress } = body;

    if (!listingId || !proposalId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get listing
    const listing = await kv.get(listingId) as any;
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify client owns the listing
    if (listing.clientAddress !== clientAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update proposal status
    const updatedProposals = listing.proposals.map((p: any) =>
      p.id === proposalId ? { ...p, status } : p
    );

    const updatedListing = {
      ...listing,
      proposals: updatedProposals,
      status: status === 'accepted' ? 'in_progress' : listing.status,
      selectedFreelancer: status === 'accepted' 
        ? updatedProposals.find((p: any) => p.id === proposalId)?.freelancerAddress
        : listing.selectedFreelancer
    };

    await kv.set(listingId, updatedListing);

    return NextResponse.json({
      success: true,
      listing: updatedListing
    });
  } catch (error) {
    console.error('Failed to update proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}
