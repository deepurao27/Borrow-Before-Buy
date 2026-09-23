import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Cable,
  FlaskConical,
  PenTool,
  Cpu,
  Camera,
  Trophy,
  BookOpen
} from 'lucide-react';

export const CategoryGrid = () => {
  const categories = [
    { name: 'Calculators', slug: 'calculators', icon: Calculator, desc: 'Scientific & graphing', count: '10+ models' },
    { name: 'Cables & Adapters', slug: 'cables-adapters', icon: Cable, desc: 'HDMI, USB-C, chargers', count: 'Any port' },
    { name: 'Lab Gear', slug: 'lab-gear', icon: FlaskConical, desc: 'Coats, glasses, kits', count: 'All sizes' },
    { name: 'Stationery & Drawing', slug: 'stationery', icon: PenTool, desc: 'Drafters, sheet holders', count: 'Semester use' },
    { name: 'Electronics & Dev Boards', slug: 'electronics', icon: Cpu, desc: 'Arduino, ESP32, sensors', count: 'IoT & projects' },
    { name: 'Tripods & Cameras', slug: 'photography', icon: Camera, desc: 'Tripods, mounts, lenses', count: 'Club events' },
    { name: 'Sports Equipment', slug: 'sports', icon: Trophy, desc: 'Badminton, TT, footballs', count: 'Evening play' },
    { name: 'Textbooks & Notes', slug: 'books', icon: BookOpen, desc: 'Reference & semester books', count: 'Batch curated' }
  ];

  return (
    <section className="py-20 bg-paper-sand/20 dark:bg-paper-sandDark/10 border-y border-paper-sand dark:border-paper-sandDark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="handwritten-note block mb-2">Campus Gear Catalog</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-ink-dark font-serif">
              What students <span className="doodle-underline">lend and borrow</span>
            </h2>
          </div>
          <Link
            to="/search"
            className="mt-4 md:mt-0 text-sm font-bold text-terracotta dark:text-terracotta-light hover:underline inline-flex items-center gap-1"
          >
            Explore all items &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Link
                key={index}
                to={`/search?category=${cat.slug}`}
                className="paper-card p-5 group hover:border-terracotta hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-paper-sand/40 dark:bg-paper-sandDark/40 flex items-center justify-center text-ink dark:text-ink-dark group-hover:bg-marigold group-hover:text-ink transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-ink dark:text-ink-dark group-hover:text-terracotta transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-0.5">
                      {cat.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-sand/60 dark:border-paper-sandDark flex justify-between text-[11px] font-semibold text-terracotta">
                  <span>{cat.count}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
