const shared=new URLSearchParams(location.search).get('group');
if(shared)await import('./shared-notebook.js?v=board20261021');
else await import('./notebook-cloud.js?v=board20261021');
await import('./notebook-share.js?v=board20261021');
await import('./site-guide.js?v=board20261021');
