const shared=new URLSearchParams(location.search).get('group');
if(shared)await import('./shared-notebook.js?v=focus-exit-fix20261015');
else await import('./notebook-cloud.js?v=focus-exit-fix20261015');
await import('./notebook-share.js?v=eraser20261018');
await import('./site-guide.js?v=eraser20261018');
