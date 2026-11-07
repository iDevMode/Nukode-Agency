import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { About } from './components/About';
import { Pricing } from './components/Pricing';
import { AiConsultant } from './components/AiConsultant';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';

function App() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <main className="min-h-screen bg-nukode-black selection:bg-white selection:text-black">
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <About />
      <Pricing />
      <AiConsultant />
      <Footer />
      <CookieConsent />
    </main>
  );
}

export default App;