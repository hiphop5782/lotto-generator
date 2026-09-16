// Set your GA4 web stream measurement ID to enable collection.
const GA_MEASUREMENT_ID = '';
window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments)};
window.trackLotto=function(name,params={}){window.gtag('event',name,params)};
if(/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)){
  window.gtag('js',new Date());
  const clean=new URL(location.href);clean.searchParams.delete('numbers');clean.hash='';
  window.gtag('config',GA_MEASUREMENT_ID,{page_location:clean.href});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+GA_MEASUREMENT_ID;document.head.append(script);
}
