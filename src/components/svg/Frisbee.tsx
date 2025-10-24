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
    <g clipPath="url(#clip0_2090_9250)">
      <path
        d="M513.274 0C326.725 0 0 108.272 0 282.837C0 403.266 139.09 437.209 216.342 438.618C479.155 443.421 773.768 310.46 773.768 164.622C773.768 29.8295 625.111 0 513.274 0Z"
        fill="url(#paint0_linear_2090_9250)"
      />
      <path
        d="M750.127 236.813C764.668 213.395 773.768 189.64 773.768 164.622C773.768 29.8295 625.111 0 513.274 0C326.725 0 0 108.272 0 282.837C0 363.003 61.6317 405.472 125.636 424.906C125.636 424.906 22.0797 386.688 22.0797 313.769C22.0797 181.743 327.835 56.3421 527.623 56.3421C680.497 56.3421 761.629 113.427 761.629 184.5C761.629 215.065 750.127 236.805 750.127 236.805V236.813Z"
        fill="url(#paint1_linear_2090_9250)"
      />
      <path
        d="M750.658 141.371C750.658 141.371 782.71 183.657 750.444 236.337C678.893 353.135 435.076 442.616 216.353 438.617C183.192 438.012 137.027 434.825 98.577 414.548C30.5242 378.667 23.0547 322.915 23.0547 322.915C29.6288 342.142 85.7425 391.728 215.664 400.308C317.69 407.041 581.98 359.853 706.032 237.908C762.651 182.247 750.015 144.298 750.015 144.298"
        fill="url(#paint2_linear_2090_9250)"
      />

      {/* === ДОБАВЛЕННЫЙ ЭЛЕМЕНТ БЛИКА === */}
      <ellipse
        id="shine-effect"
        cx="387"
        cy="220"
        rx="300"
        ry="80"
        fill="rgba(255, 255, 255, 0.15)"
        transform="rotate(-30 387 220)"
        filter="blur(10px)"
      />
      {/* ==================================== */}
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_2090_9250"
        x1="358.096"
        y1="127.775"
        x2="463.431"
        y2="472.813"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FCE2C1" />
        <stop offset="0.23" stopColor="#FEE7CB" />
        <stop offset="0.49" stopColor="#FFEACF" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_2090_9250"
        x1="0"
        y1="212.453"
        x2="773.768"
        y2="212.453"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFEACF" />
        <stop offset="0.15" stopColor="#FFF3E0" />
        <stop offset="0.31" stopColor="#FFF9EC" />
        <stop offset="0.49" stopColor="#FFFBF0" />
        <stop offset="0.77" stopColor="#FFF9EE" />
        <stop offset="0.87" stopColor="#FFF6E7" />
        <stop offset="0.95" stopColor="#FFF0DB" />
        <stop offset="1" stopColor="#FFEACF" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_2090_9250"
        x1="49.8334"
        y1="364.112"
        x2="729.305"
        y2="258.048"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F1D5B2" />
        <stop offset="0.45" stopColor="#F5DCBC" />
        <stop offset="1" stopColor="#FFEACF" />
      </linearGradient>
      <clipPath id="clip0_2090_9250">
        <rect width="774" height="439" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

Frisbee.displayName = "Frisbee";