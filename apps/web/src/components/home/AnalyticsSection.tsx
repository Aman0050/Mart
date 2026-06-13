import React from "react";
import { TrendingUp, Users, Globe, ShoppingBag } from "lucide-react";

export function AnalyticsSection() {
  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-foreground to-foreground opacity-50"></div>
      
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
              The Engine Driving Global Trade
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-lg">
              Nexmarto is the fastest-growing B2B marketplace. Our platform handles millions of interactions daily, connecting buyers and suppliers seamlessly.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-foreground bg-gray-700 flex items-center justify-center">
                    <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="w-full h-full rounded-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-gray-300">
                Join <span className="text-white font-bold">1M+</span> active users
              </div>
            </div>
          </div>

          {/* Right Stats Grid */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-6 w-full">
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-3xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-4xl font-black text-white mb-2">1.2M</p>
              <p className="text-gray-400 font-medium">Registered Buyers</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-3xl hover:bg-gray-800 transition-colors translate-y-8">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-4xl font-black text-white mb-2">$500M+</p>
              <p className="text-gray-400 font-medium">Annual GMV</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-3xl hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-4xl font-black text-white mb-2">190+</p>
              <p className="text-gray-400 font-medium">Countries</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-3xl hover:bg-gray-800 transition-colors translate-y-8">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-4xl font-black text-white mb-2">48h</p>
              <p className="text-gray-400 font-medium">Avg Source Time</p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
