// Service Worker untuk Menangkap Push Notification
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'STUDETOLS', body: 'Ada pembaruan baru!' };

    const options = {
        body: data.body,
        icon: 'https://ui-avatars.com/api/?name=ST&background=4F46E5&color=fff',
        badge: 'https://ui-avatars.com/api/?name=ST&background=4F46E5&color=fff',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/dashboard.html')
    );
});