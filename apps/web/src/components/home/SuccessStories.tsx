import React from "react";
import { Star, Quote } from "lucide-react";

const STORIES = [
  {
    id: 1,
    quote: "Nexmarto completely transformed how we source raw materials. The verified supplier network saved us countless hours of vetting, and we reduced our supply chain costs by 18% in the first quarter.",
    author: "Rajesh Kumar",
    role: "Procurement Director",
    company: "Apex Manufacturing Solutions",
    rating: 5,
  },
  {
    id: 2,
    quote: "As a manufacturer, joining Nexmarto was the best decision for our B2B lead generation. We've connected with enterprise buyers from over 12 countries, expanding our export business rapidly.",
    author: "Anita Desai",
    role: "CEO",
    company: "Global Textiles India",
    rating: 5,
  },
  {
    id: 3,
    quote: "The RFQ feature is incredibly efficient. We submitted a complex request for custom automotive molds and received 5 highly competitive quotes from certified factories within 48 hours.",
    author: "Marcus Chen",
    role: "Supply Chain Manager",
    company: "Volt Motors",
    rating: 5,
  }
];

export function SuccessStories() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Trusted by Industry Leaders</h2>
          <p className="text-muted-foreground text-lg">
            See how businesses around the world are scaling their operations with Nexmarto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STORIES.map((story) => (
            <div key={story.id} className="relative bg-card p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <Quote className="absolute top-6 right-8 w-12 h-12 text-primary/10 rotate-180" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(story.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <p className="text-foreground font-medium text-lg leading-relaxed mb-8 relative z-10">
                "{story.quote}"
              </p>
              
              <div className="flex items-center gap-4 border-t pt-6 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {story.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{story.author}</h4>
                  <p className="text-sm text-muted-foreground">{story.role}, {story.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
