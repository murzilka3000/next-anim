'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    // Отправляем событие "hit" в Яндекс.Метрику при изменении URL
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(105181480, 'hit', url);
    }
  }, [pathname, searchParams]);

  return (
    <Script id="yandex-metrika">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

        ym(105181480, 'init', {
            ssr:true,
            webvisor:true,
            clickmap:true,
            ecommerce:"dataLayer",
            accurateTrackBounce:true,
            trackLinks:true,
            defer: true // Отключаем автоматическую отправку первого просмотра
        });
      `}
    </Script>
  );
}