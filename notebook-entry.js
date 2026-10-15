const shared=new URLSearchParams(location.search).get('group');
if(shared)await import('./shared-notebook.js?v=sharing-simple20261015');
else await import('./notebook-cloud.js?v=community-news20261015');
await import('./notebook-share.js?v=sharing-simple20261015');
await import('./site-guide.js?v=no-calls20261015');
