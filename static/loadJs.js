(async () => {
    const pathname = window.location.pathname;
    const group = decodeURIComponent(pathname.replace(/^\/[a-z]*\//, '').replace(/\/$/, ''));
    const statusURL = `/group/${group}/.status`;
  
    try {
      const res = await fetch(statusURL);
      if (!res.ok) throw new Error(`Failed to load status for group ${group}`);
      const status = await res.json();
  
      const customUi = status.customUi;
      const basePath = `/custom-ui/${group}/`;
  
      // Helper to load resource if it exists
      const loadIfExists = async (type, path, fallback) => {
        try {
          const resp = await fetch(path, { method: 'HEAD' });
          if (resp.ok) {
            if (type === 'css') {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = path;
              document.head.appendChild(link);
            } else if (type === 'js') {
              const script = document.createElement('script');
              script.src = path;
              script.defer = true;
              document.head.appendChild(script);
            } else if (type === 'html') {
              const htmlRes = await fetch(path);
              const htmlText = await htmlRes.text();
              document.body.innerHTML = htmlText;
            }
          } else if (fallback) {
            fallback();
          }
        } catch (e) {
          if (fallback) fallback();
        }
      };
  
      const uiName = typeof customUi === 'string' ? customUi : null;
  
      if (uiName) {
        await loadIfExists('html', `${basePath}${uiName}.html`);
        await loadIfExists('css', `${basePath}${uiName}.css`);
        await loadIfExists('js', `${basePath}${uiName}.js`, () => {
          const fallbackScript = document.createElement('script');
          fallbackScript.src = '/galene.js';
          fallbackScript.defer = true;
          document.head.appendChild(fallbackScript);
        });
      } else {
        // No custom UI, load default galene.js
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '/galene.js';
        fallbackScript.defer = true;
        document.head.appendChild(fallbackScript);
      }
  
    } catch (err) {
      console.error(err);
      const fallbackScript = document.createElement('script');
      fallbackScript.src = '/galene.js';
      fallbackScript.defer = true;
      document.head.appendChild(fallbackScript);
    }
  })();
  