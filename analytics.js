// Set your GA4 web stream measurement ID to enable collection.
const GA_MEASUREMENT_ID = '';
window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments)};
window.trackLotto=function(name,params={}){window.gtag('event',name,params)};
if(/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)){
  window.gtag('js',new Date());
  const clean=new URL(location.href);
  // Keep share attribution in analytics without lengthening the public link.
  if((clean.searchParams.has('s')||clean.searchParams.has('numbers'))&&!clean.searchParams.has('utm_source')){
    clean.searchParams.set('utm_source','lotto_share');clean.searchParams.set('utm_medium','referral');
  }
  clean.searchParams.delete('numbers');clean.searchParams.delete('s');clean.hash='';
  window.gtag('config',GA_MEASUREMENT_ID,{page_location:clean.href});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+GA_MEASUREMENT_ID;document.head.append(script);
}
