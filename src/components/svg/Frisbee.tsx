// src/components/svg/Frisbee.tsx
import React from "react";

export const Frisbee = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => (
  <svg
    ref={ref}
    width="774"
    height="439"
    viewBox="0 0 774 439"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_2001_63)">
      <path d="M513.274 0C326.725 0 0 108.272 0 282.837C0 403.266 139.09 437.209 216.342 438.618C479.155 443.421 773.768 310.46 773.768 164.622C773.768 29.8295 625.111 0 513.274 0Z" fill="url(#paint0_linear_2001_63)" />
      <path d="M750.127 236.813C764.668 213.395 773.768 189.64 773.768 164.622C773.768 29.8295 625.111 0 513.274 0C326.725 0 0 108.272 0 282.837C0 363.003 61.6317 405.472 125.636 424.906C125.636 424.906 22.0797 386.688 22.0797 313.769C22.0797 181.743 327.835 56.3421 527.623 56.3421C680.497 56.3421 761.629 113.427 761.629 184.5C761.629 215.065 750.127 236.805 750.127 236.805V236.813Z" fill="url(#paint1_linear_2001_63)" />
      
      {/* Линии-блики с уникальными классами для GSAP */}
      <path className="shine-line-3" d="M615.838 275.565C589.944 291.173 559.12 306.177 524.838 319.878" stroke="#FFF9EE" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="shine-line-1" d="M102.338 235.87C111.448 228.551 121.656 221.275 132.838 214.113" stroke="#FFF9EE" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path className="shine-line-2" d="M148.838 204.332C171.258 191.23 196.856 178.635 224.838 167" stroke="#FFF9EE" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>

      <path d="M750.655 141.372C750.655 141.372 782.707 183.658 750.441 236.338C678.89 353.136 435.073 442.617 216.35 438.618C183.189 438.013 137.024 434.826 98.5741 414.549C30.5213 378.668 23.0518 322.916 23.0518 322.916C29.6259 342.143 85.7396 391.729 215.661 400.309C317.687 407.042 581.977 359.854 706.029 237.909C762.648 182.248 750.012 144.299 750.012 144.299" fill="url(#paint2_linear_2001_63)" />
    </g>
    <defs>
      <linearGradient id="paint0_linear_2001_63" x1="358.096" y1="127.775" x2="463.431" y2="472.813" gradientUnits="userSpaceOnUse"><stop stopColor="#FCE2C1"/><stop offset="0.23" stopColor="#FEE7CB"/><stop offset="0.49" stopColor="#FFEACF"/></linearGradient>
      <linearGradient id="paint1_linear_2001_63" x1="0" y1="212.453" x2="773.768" y2="212.453" gradientUnits="userSpaceOnUse"><stop stopColor="#FFEACF"/><stop offset="0.15" stopColor="#FFF3E0"/><stop offset="0.31" stopColor="#FFF9EC"/><stop offset="0.49" stopColor="#FFFBF0"/><stop offset="0.77" stopColor="#FFF9EE"/><stop offset="0.87" stopColor="#FFF6E7"/><stop offset="0.95" stopColor="#FFF0DB"/><stop offset="1" stopColor="#FFEACF"/></linearGradient>
      <linearGradient id="paint2_linear_2001_63" x1="49.8305" y1="364.113" x2="729.302" y2="258.049" gradientUnits="userSpaceOnUse"><stop stopColor="#F1D5B2"/><stop offset="0.45" stopColor="#F5DCBC"/><stop offset="1" stopColor="#FFEACF"/></linearGradient>
      <clipPath id="clip0_2001_63"><rect width="774" height="439" fill="white"/></clipPath>
    </defs>
  </svg>
));

Frisbee.displayName = "Frisbee";