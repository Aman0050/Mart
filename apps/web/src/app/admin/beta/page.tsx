import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@nexmarto/ui';
import { Users, Package, FileText, Activity, MessageSquare, AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Closed Beta Operations Dashboard',
};

async function getBetaMetrics() {
  // Hardcoded for now since apiClient is removed
  return {
    activeSuppliers: 15,
    activeBuyers: 42,
    productsUploaded: 230,
    leadsGenerated: 85,
    rfqsGenerated: 12,
    openBugs: 3,
    npsScore: 8.5
  };
}

export default async function BetaDashboardPage() {
  const metrics = await getBetaMetrics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Closed Beta Dashboard</h1>
        <p className="text-gray-400 mt-2">Real-time monitoring of the Nexmarto closed beta phase.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.activeSuppliers}</div>
            <p className="text-xs text-green-400 mt-1">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Buyers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.activeBuyers}</div>
            <p className="text-xs text-green-400 mt-1">+5 from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Products Uploaded</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.productsUploaded}</div>
            <p className="text-xs text-green-400 mt-1">Target: 500</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Leads Generated</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.leadsGenerated}</div>
            <p className="text-xs text-green-400 mt-1">+12 this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">NPS Score</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.npsScore}/10</div>
            <p className="text-xs text-gray-400 mt-1">Based on feedback modal</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">RFQs Generated</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.rfqsGenerated}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Open Bugs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{metrics.openBugs}</div>
            <p className="text-xs text-gray-400 mt-1">0 Critical</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
