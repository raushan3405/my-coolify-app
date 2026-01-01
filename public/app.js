document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const mainContent = document.getElementById('main-content');

    const routes = {
        '#dashboard': { path: 'index.html', script: 'script.js' },
        '#customers': { path: 'customers.html', script: 'customers.js' },
        '#new-customer-v2': { path: 'new-customer-v2.html', script: 'new-customer-v2.js' },
        '#customer-details': { path: 'customer-details.html', script: 'customer-details.js' },
        '#edit-customer-v2': { path: 'edit-customer-v2.html', script: 'edit-customer-v2.js' },
        '#my-orders': { path: 'my-orders.html', script: 'my-orders.js' },
        '#new-order': { path: 'new-order.html', script: 'new-order.js' },
        '#services': { path: 'services.html', script: 'services.js' },
        '#new-service': { path: 'new-service.html', script: 'new-service.js' },
        '#edit-service': { path: 'edit-service.html', script: 'edit-service.js' },
        '#sales': { path: 'sales.html', script: 'sales.js' },
        '#invoices': { path: 'invoices.html', script: 'invoices.js' },
        '#invoice-view': { path: 'invoice-view.html', script: 'invoice-view.js' },
        '#leaderboard': { path: 'leaderboard.html', script: 'leaderboard.js' },
        '#f-team': { path: 'f-team.html', script: 'f-team.js' },
        '#budget-track': { path: 'budget-track.html', script: 'budget-track.js' },
        '#settings': { path: 'settings.html', script: null },
        '#notifications': { path: 'notifications.html', script: 'notifications.js' },
        '#support': { path: 'support.html', script: 'support.js' },
        '#new-ticket': { path: 'new-ticket.html', script: 'new-ticket.js' },
        '#view-ticket': { path: 'view-ticket.html', script: 'view-ticket.js' },
        '#social-media': { path: 'social-media.html', script: 'social-media.js' }
    };

    const loadContentAndScript = async (filePath, scriptPath) => {
        try {
            const response = await fetch(filePath);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.querySelector('main').innerHTML;
            mainContent.innerHTML = content;

            // Remove old script if it exists
            const oldScript = document.getElementById('page-script');
            if(oldScript) oldScript.remove();

            // Add new script
            if (scriptPath) {
                const newScript = document.createElement('script');
                newScript.src = scriptPath;
                newScript.id = 'page-script';
                document.body.appendChild(newScript);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            mainContent.innerHTML = `<p style="color: red; text-align: center;">Error loading content.</p>`;
        }
    };

    const handleRouteChange = () => {
        const hash = window.location.hash || '#dashboard';
        const routeKey = hash.split('?')[0];
        const route = routes[routeKey];

        if (route) {
            loadContentAndScript(route.path, route.script);
            updateActiveLink(routeKey);
        }
    };

    const updateActiveLink = (currentHash) => {
        sidebarContainer.querySelectorAll('.menu a, .bottom-menu a').forEach(link => {
            const linkHash = link.getAttribute('href').split('?')[0];
            if (linkHash === currentHash) {
                link.parentElement.classList.add('active');
            } else {
                link.parentElement.classList.remove('active');
            }
        });
    };

    // Initial Load
    fetch('sidebar.html').then(res => res.text()).then(html => {
        sidebarContainer.innerHTML = html;
        handleRouteChange(); // Initial route
    });

    // Listen for hash changes
    window.addEventListener('hashchange', handleRouteChange);
});
