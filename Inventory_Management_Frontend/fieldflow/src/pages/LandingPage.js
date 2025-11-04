import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import RolesSection from '../components/RolesSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const LandingPage = () => (
  <>
    <Header />
    <main>
      <HeroSection />
      <FeaturesSection />
      <RolesSection />
      <CTASection />
    </main>
    <Footer />
  </>
);

export default LandingPage;
