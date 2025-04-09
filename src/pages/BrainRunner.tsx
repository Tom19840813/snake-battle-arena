
import { BrainRunnerGame } from '../components/game/BrainRunnerGame';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Home } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BrainRunner = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'archive'>('game');
  
  // Mock fact archive data (in real app, would be loaded from storage)
  const factArchive = [
    {
      id: '1',
      date: '2023-04-08',
      content: 'The human brain weighs about 3 pounds (1.4 kilograms).',
      category: 'science',
      collected: true
    },
    {
      id: '2',
      date: '2023-04-07',
      content: 'Dolphins sleep with one half of their brain at a time.',
      category: 'animals',
      collected: true
    },
    {
      id: '3',
      date: '2023-04-06',
      content: 'The brain uses 20% of the total oxygen in your body.',
      category: 'health',
      collected: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Home size={18} />
              Home
            </Button>
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Brain Runner
          </h1>
          
          <div className="w-20" /> {/* Empty space for balance */}
        </div>
        <p className="text-center text-gray-600 mt-2">
          Run, jump, and collect a new interesting fact every day!
        </p>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <Button
              variant={activeTab === 'game' ? 'default' : 'outline'}
              className={`rounded-none ${activeTab === 'game' ? 'bg-blue-500' : ''}`}
              onClick={() => setActiveTab('game')}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Play Game
            </Button>
            <Button
              variant={activeTab === 'archive' ? 'default' : 'outline'}
              className={`rounded-none ${activeTab === 'archive' ? 'bg-blue-500' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Fact Archive
            </Button>
          </div>
        </div>
        
        {activeTab === 'game' ? (
          <BrainRunnerGame />
        ) : (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fact Archive</CardTitle>
                <CardDescription>Browse all the facts you've collected</CardDescription>
              </CardHeader>
              <CardContent>
                {factArchive.length > 0 ? (
                  <div className="space-y-4">
                    {factArchive.map(fact => (
                      <div key={fact.id} className="p-4 bg-white border rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {new Date(fact.date).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {fact.category}
                          </span>
                        </div>
                        <p className="text-gray-800">{fact.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">You haven't collected any facts yet. Play the game to start collecting!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <footer className="max-w-4xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>&copy; 2023 Brain Runner - Collect a new fact every day!</p>
      </footer>
    </div>
  );
};

export default BrainRunner;
