const geolib = require('geolib');

// Calculate distance between two points in kilometers
exports.calculateDistance = (point1, point2) => {
    // point1 and point2 should be { latitude, longitude }
    const distance = geolib.getDistance(point1, point2);
    return (distance / 1000).toFixed(1); // Convert meters to km
};

// Get nearby providers within radius
exports.getNearbyProviders = async (userLat, userLng, radiusKm = 10, Provider) => {
    // Find all verified providers
    const providers = await Provider.find({ verified: true })
        .populate('userId', 'name email profilePicture phone');

    // Filter by distance
    const nearbyProviders = providers.filter(provider => {
        if (!provider.location || !provider.location.coordinates) return false;

        const [lng, lat] = provider.location.coordinates;
        const distance = geolib.getDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: lat, longitude: lng }
        );

        const distanceKm = distance / 1000;
        provider.distance = distanceKm.toFixed(1);

        return distanceKm <= radiusKm;
    });

    // Sort by distance
    return nearbyProviders.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Geocode address to coordinates using OpenStreetMap Nominatim (Free)
exports.geocodeAddress = async (address) => {
    const axios = require('axios');

    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'SmartUrbanServiceLocator/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                lat: parseFloat(location.lat),
                lng: parseFloat(location.lon),
                formattedAddress: location.display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
