
// Utility functions for extracting colors from banners and creating gradients

export const getBackgroundGradientFromBanner = (bannerType: string | null, bannerValue: string | null): string => {
  if (!bannerValue) {
    return 'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900';
  }

  switch (bannerType) {
    case 'color':
      return `bg-gradient-to-br from-slate-900 via-slate-800 to-[${bannerValue}]/30`;
    
    case 'gradient':
      // Extract gradient and create a more subtle version for background
      if (bannerValue.includes('linear-gradient')) {
        // Create a darker, more subtle version of the gradient
        return `bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-700/85`;
      }
      return 'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900';
    
    case 'image':
      // For images, create a complementary gradient
      return 'bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-indigo-900/40';
    
    default:
      return 'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900';
  }
};

export const getInlineBackgroundStyle = (bannerType: string | null, bannerValue: string | null): React.CSSProperties => {
  if (!bannerValue) {
    return {};
  }

  switch (bannerType) {
    case 'color':
      // Create a subtle radial gradient with the banner color
      return {
        background: `radial-gradient(ellipse at top, ${bannerValue}15 0%, rgb(15 23 42) 50%, rgb(30 41 59) 100%)`
      };
    
    case 'gradient':
      if (bannerValue.includes('linear-gradient')) {
        // Extract colors from the gradient and create a subtle version
        const gradientMatch = bannerValue.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
        if (gradientMatch && gradientMatch.length >= 2) {
          const color1 = gradientMatch[0];
          const color2 = gradientMatch[gradientMatch.length - 1];
          return {
            background: `radial-gradient(ellipse at top, ${color1}15 0%, rgb(15 23 42) 50%, ${color2}10 100%)`
          };
        }
      }
      return {
        background: 'radial-gradient(ellipse at top, rgb(99 102 241 / 0.15) 0%, rgb(15 23 42) 50%, rgb(30 41 59) 100%)'
      };
    
    case 'image':
      // For images, create a subtle overlay effect
      return {
        background: 'radial-gradient(ellipse at top, rgb(79 70 229 / 0.2) 0%, rgb(15 23 42) 40%, rgb(30 41 59) 100%)'
      };
    
    default:
      return {};
  }
};
