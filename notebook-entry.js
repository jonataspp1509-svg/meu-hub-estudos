const shared=new URLSearchParams(location.search).get('group');
if(shared)await import('./shared-notebook.js?v=writing20261026');
else await import('./notebook-cloud.js?v=writing20261026');
await import('./notebook-share.js?v=writing20261026');
await import('./site-guide.js?v=writing20261026');
