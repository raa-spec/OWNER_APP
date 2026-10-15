import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Resilient in-memory live queues (key: businessId or category)
const inMemoryQueues = new Map();

function getInitialQueueState(category = 'saloon') {
  const isClinic = category === 'clinic';
  const isLab = category === 'diagnostic_lab';
  const isParlour = category === 'parlour';

  if (isClinic) {
    return {
      nowServing: {
        tokenNo: 'C-101',
        customerName: 'Aarav Patel',
        customerPhone: '9876543210',
        service: 'General Consultation',
        staffName: 'Dr. Rajesh Sharma',
        station: 'OPD Cabin 101',
        calledAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      waitingList: [
        {
          tokenNo: 'C-102',
          customerName: 'Meera Deshmukh',
          customerPhone: '9876543211',
          service: 'Dental Scaling & Checkup',
          staffName: 'Dr. Ananya Rao',
          station: 'Dental Suite 1',
          bookedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          waitMinutes: 10,
        },
        {
          tokenNo: 'C-103',
          customerName: 'Kunal Singhania',
          customerPhone: '9876543212',
          service: 'Fever & Cough Consultation',
          staffName: 'Dr. Rajesh Sharma',
          station: 'OPD Cabin 101',
          bookedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          waitMinutes: 25,
        },
      ],
      completedList: [
        {
          tokenNo: 'C-099',
          customerName: 'Sanjay Gupta',
          service: 'Blood Pressure Check',
          staffName: 'Dr. Rajesh Sharma',
          completedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        },
      ],
      nextTokenNumber: 104,
    };
  }

  if (isLab) {
    return {
      nowServing: {
        tokenNo: 'L-101',
        customerName: 'Sunita Reddy',
        customerPhone: '9876543220',
        service: 'Complete Blood Count (CBC)',
        staffName: 'Phlebotomist Desk',
        station: 'Sample Counter 1',
        calledAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      waitingList: [
        {
          tokenNo: 'L-102',
          customerName: 'Vikram Joshi',
          customerPhone: '9876543221',
          service: 'Lipid Profile (Fasting)',
          staffName: 'Phlebotomist Desk',
          station: 'Sample Counter 1',
          bookedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          waitMinutes: 8,
        },
        {
          tokenNo: 'L-103',
          customerName: 'Anita Nair',
          customerPhone: '9876543222',
          service: 'Thyroid Profile (TSH)',
          staffName: 'Phlebotomist Desk',
          station: 'Sample Counter 2',
          bookedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          waitMinutes: 18,
        },
      ],
      completedList: [
        {
          tokenNo: 'L-099',
          customerName: 'Ramesh Kulkarni',
          service: 'HbA1c Blood Sugar',
          staffName: 'Phlebotomist Desk',
          completedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        },
      ],
      nextTokenNumber: 104,
    };
  }

  // Saloon & Parlour
  const prefix = isParlour ? 'P' : 'S';
  return {
    nowServing: {
      tokenNo: `${prefix}-101`,
      customerName: isParlour ? 'Sneha Roy' : 'Rohan Sharma',
      customerPhone: '9876543230',
      service: isParlour ? 'Hair Spa & Glow Facial' : 'Classic Haircut & Fade',
      staffName: isParlour ? 'Pooja Sharma' : 'Sameer Khan',
      station: isParlour ? 'Station A' : 'Chair #1',
      calledAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    },
    waitingList: [
      {
        tokenNo: `${prefix}-102`,
        customerName: isParlour ? 'Divya Nair' : 'Amit Verma',
        customerPhone: '9876543231',
        service: isParlour ? 'Bridal Makeup Consultation' : 'Beard Sculpt & Shave',
        staffName: isParlour ? 'Meera Patel' : 'Arjun Verma',
        station: isParlour ? 'Bridal Suite 1' : 'Chair #2',
        bookedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        waitMinutes: 12,
      },
      {
        tokenNo: `${prefix}-103`,
        customerName: isParlour ? 'Kavita Iyer' : 'Deepak Chopra',
        customerPhone: '9876543232',
        service: isParlour ? 'Manicure & Pedicure' : 'Head Massage & Wash',
        staffName: isParlour ? 'Pooja Sharma' : 'Sameer Khan',
        station: isParlour ? 'Station A' : 'Chair #1',
        bookedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        waitMinutes: 24,
      },
    ],
    completedList: [
      {
        tokenNo: `${prefix}-099`,
        customerName: isParlour ? 'Ananya Sen' : 'Nikhil Rao',
        service: isParlour ? 'Hair Styling' : 'Quick Trim',
        staffName: isParlour ? 'Pooja Sharma' : 'Sameer Khan',
        completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
    nextTokenNumber: 104,
  };
}

function getQueue(businessId = 'default', category = 'saloon') {
  const key = `${businessId}_${category}`;
  if (!inMemoryQueues.has(key)) {
    inMemoryQueues.set(key, getInitialQueueState(category));
  }
  return inMemoryQueues.get(key);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || 'default';
    const category = searchParams.get('category') || 'saloon';

    const queue = getQueue(businessId, category);

    const stats = {
      nowServing: queue.nowServing ? queue.nowServing.tokenNo : 'None',
      currentlyWaiting: queue.waitingList.length,
      completedToday: queue.completedList.length,
      avgWaitMinutes: queue.waitingList.length * 12,
    };

    return NextResponse.json(
      {
        success: true,
        businessId,
        category,
        nowServing: queue.nowServing,
        waitingList: queue.waitingList,
        completedList: queue.completedList,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Live Queue GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live queue data.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, businessId = 'default', category = 'saloon' } = body;

    const queue = getQueue(businessId, category);

    if (action === 'book') {
      const {
        customerName,
        customerPhone,
        service,
        staffName,
        station,
      } = body;

      if (!customerName) {
        return NextResponse.json(
          { success: false, error: 'Customer name is required.' },
          { status: 400 }
        );
      }

      const prefix = category === 'clinic' ? 'C' : category === 'diagnostic_lab' ? 'L' : category === 'parlour' ? 'P' : 'S';
      const tokenNo = `${prefix}-${queue.nextTokenNumber++}`;

      const newToken = {
        tokenNo,
        customerName: customerName.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : 'Walk-in',
        service: service || 'Standard Service',
        staffName: staffName || 'Any Available Specialist',
        station: station || 'Counter 1',
        bookedAt: new Date().toISOString(),
        waitMinutes: (queue.waitingList.length + 1) * 12,
      };

      queue.waitingList.push(newToken);

      // If currently no one is being served, automatically call this token
      if (!queue.nowServing) {
        queue.nowServing = {
          ...queue.waitingList.shift(),
          calledAt: new Date().toISOString(),
        };
      }

      return NextResponse.json({
        success: true,
        message: `Token ${tokenNo} issued successfully!`,
        token: newToken,
        queue,
      });
    }

    if (action === 'call_next') {
      const { staffName } = body;

      // Complete current serving if exists
      if (queue.nowServing) {
        queue.completedList.unshift({
          ...queue.nowServing,
          completedAt: new Date().toISOString(),
        });
        queue.nowServing = null;
      }

      // Pick next token (optionally for specific staffName)
      let nextIndex = -1;
      if (staffName) {
        nextIndex = queue.waitingList.findIndex(
          (t) => t.staffName?.toLowerCase() === staffName.toLowerCase()
        );
      }
      if (nextIndex === -1 && queue.waitingList.length > 0) {
        nextIndex = 0;
      }

      if (nextIndex !== -1) {
        const nextToken = queue.waitingList.splice(nextIndex, 1)[0];
        queue.nowServing = {
          ...nextToken,
          calledAt: new Date().toISOString(),
        };
      }

      return NextResponse.json({
        success: true,
        message: queue.nowServing
          ? `Now calling Token ${queue.nowServing.tokenNo}`
          : 'No more waiting tokens in queue.',
        nowServing: queue.nowServing,
        queue,
      });
    }

    if (action === 'complete') {
      if (queue.nowServing) {
        queue.completedList.unshift({
          ...queue.nowServing,
          completedAt: new Date().toISOString(),
        });
        queue.nowServing = null;
      }

      return NextResponse.json({
        success: true,
        message: 'Token marked as completed.',
        queue,
      });
    }

    if (action === 'skip') {
      if (queue.nowServing) {
        // Move current to end of waiting list
        const skippedToken = {
          ...queue.nowServing,
          waitMinutes: 15,
        };
        queue.nowServing = null;
        queue.waitingList.push(skippedToken);
      }

      return NextResponse.json({
        success: true,
        message: 'Token skipped and moved to end of queue.',
        queue,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action specified.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Live Queue POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error processing queue action.' },
      { status: 500 }
    );
  }
}
