import { Hotel } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center">
        <Hotel className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-headline font-bold text-primary">HotelMend</h1>
      </div>
    </header>
  );
}
