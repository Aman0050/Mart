'use client';
import { CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@nexmarto/ui';

export function BuyerChecklist({ user, enquiriesCount, rfqsCount }: any) {
  const steps = [
    {
      title: 'Verify Email Address',
      completed: user?.emailVerified,
      link: '/dashboard/settings',
    },
    {
      title: 'Complete Buyer Profile',
      completed: !!user?.fullName && !!user?.phone,
      link: '/dashboard/settings',
    },
    {
      title: 'Search for Products',
      completed: enquiriesCount > 0 || rfqsCount > 0, // proxy for searching
      link: '/search',
    },
    {
      title: 'Submit First Enquiry',
      completed: enquiriesCount > 0,
      link: '/search',
    },
    {
      title: 'Create an RFQ',
      completed: rfqsCount > 0,
      link: '/dashboard/rfqs/new',
    },
  ];

  const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Buyer Welcome Guide ({progress}%)</CardTitle>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              ) : (
                <Circle className="text-gray-500 h-5 w-5" />
              )}
              <Link href={step.link} className={`text-sm ${step.completed ? 'text-gray-400 line-through' : 'text-purple-400 hover:underline'}`}>
                {step.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
