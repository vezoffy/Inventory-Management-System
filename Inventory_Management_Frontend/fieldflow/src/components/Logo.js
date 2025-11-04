import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import localLogo from '../FieldFlowLogo.png';

// Small, reusable Logo component — clicking it goes to the landing page (/)
const Logo = ({ height = 40 }) => {
  const logoUrl = localLogo || 'https://placehold.co/150x40/ffffff/0891b2?text=FieldFlow&font=inter';
  const logoAlt = 'FieldFlow Logo';

  return (
    <RouterLink to="/" style={{ display: 'inline-block' }}>
      <img
        src={logoUrl}
        alt={logoAlt}
        style={{ height: `${height}px`, width: 'auto', display: 'block' }}
      />
    </RouterLink>
  );
};

export default Logo;