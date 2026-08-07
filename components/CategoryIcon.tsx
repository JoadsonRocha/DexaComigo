import React from 'react';
import { Scissors, Brush, Droplet, Flower2, Eye, Sparkles, ArrowRight } from 'lucide-react';

export function categoryIcon(id: string, size = 20): React.ReactNode {
  switch (id) {
    case 'hair': return <Scissors size={size} />;
    case 'nails': return <Sparkles size={size} />;
    case 'makeup': return <Brush size={size} />;
    case 'hair-removal': return <Droplet size={size} />;
    case 'eyebrows': return <Eye size={size} />;
    case 'facial': return <Sparkles size={size} />;
    case 'body': return <Flower2 size={size} />;
    default: return <ArrowRight size={size} />;
  }
}
