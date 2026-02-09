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

// Geocode address to coordinates using Google Geocoding API
exports.geocodeAddress = async (address) => {
    const axios = require('axios');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('Google Maps API key not configured');
        return null;
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: apiKey
            }
        });

        if (response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: response.data.results[0].formatted_address
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
