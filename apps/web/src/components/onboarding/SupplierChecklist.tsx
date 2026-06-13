'use client';
import { CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@nexmarto/ui';

export function SupplierChecklist({ user, company, productsCount, leadsCount }: any) {
  const steps = [
    {
      title: 'Verify Email Address',
      completed: user?.emailVerified,
      link: '/dashboard/settings',
    },
    {
      title: 'Create Company Profile',
      completed: !!company,
      link: '/dashboard/company/new',
    },
    {
      title: 'Upload Company Logo',
      completed: !!company?.logoUrl,
      link: '/dashboard/company/edit',
    },
    {
      title: 'Upload Minimum 10 Products',
      completed: productsCount >= 10,
      link: '/dashboard/products/new',
    },
    {
      title: 'Receive First Lead',
      completed: leadsCount > 0,
      link: '/dashboard/leads',
    },
  ];

  const progress = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Supplier Onboarding ({progress}%)</CardTitle>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
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
              <Link href={step.link} className={`text-sm ${step.completed ? 'text-gray-400 line-through' : 'text-blue-400 hover:underline'}`}>
                {step.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
