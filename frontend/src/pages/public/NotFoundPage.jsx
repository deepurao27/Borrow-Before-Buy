import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="paper-card max-w-md p-8 sm:p-12 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-paper-sand/40 dark:bg-paper-sandDark/40 text-terracotta flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <span className="handwritten-note block text-xl">404: Lost on Campus</span>
        <h1 className="text-2xl font-bold font-serif text-ink dark:text-ink-dark">
          This page got borrowed and never returned!
        </h1>
        <p className="text-xs text-ink-muted dark:text-ink-darkMuted leading-relaxed">
          The link you followed doesn't exist on the campus noticeboard. Let's head back to the main lobby.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Noticeboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
