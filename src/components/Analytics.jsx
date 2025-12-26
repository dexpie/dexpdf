import React, { useEffect } from 'react'

export default function Analytics() {
    useEffect(() => {
        // This is a placeholder for actual analytics script (e.g. Google Analytics / Plausible)
        // To enable, just uncomment and add ID.
        /*
        const script = document.createElement('script');
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXX";
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXX');
        */
        console.log("Analytics initialized (stub)")
    }, [])
    return null
}
