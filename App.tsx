import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { Pricing } from './components/Pricing';
import { AiConsultant } from './components/AiConsultant';
import { Footer } from './components/Footer';

function App() {
  return (
    <main className="min-h-screen bg-nukode-black selection:bg-white selection:text-black">
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <AiConsultant />
      <Pricing />
      <Footer />
    </main>
  );
}

export default App;