import { useState, useEffect, useRef, useCallback } from 'react';

export type GeoStatus = 'idle' | 'watching' | 'denied';

interface GeolocationState {
    userPos: [number, number] | null;
    accuracy: number | null;
    geoStatus: GeoStatus;
}

const GEO_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 5_000,
    timeout: 30_000,
};

const GEO_OPTIONS_LOW_ACCURACY: PositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 10_000,
    timeout: 30_000,
};

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        userPos: null,
        accuracy: null,
        geoStatus: 'idle',
    });
    const watchIdRef = useRef<number | null>(null);

    const startWatching = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, geoStatus: 'denied' }));
            return;
        }
        setState(prev => ({ ...prev, geoStatus: 'watching' }));

        const onSuccess = (pos: GeolocationPosition) => {
            setState({
                userPos: [pos.coords.latitude, pos.coords.longitude],
                accuracy: pos.coords.accuracy,
                geoStatus: 'watching',
            });
        };

        const onError = (err: GeolocationPositionError) => {
            console.warn('[useGeolocation] error', err.code, err.message);
            if (err.code === err.TIMEOUT && GEO_OPTIONS.enableHighAccuracy) {
                console.log('[useGeolocation] High accuracy timeout, trying low accuracy...');
                navigator.geolocation.getCurrentPosition(onSuccess, (e) => {
                    console.warn('[useGeolocation] Low accuracy also failed', e.message);
                    setState(prev => ({ ...prev, geoStatus: 'denied' }));
                }, GEO_OPTIONS_LOW_ACCURACY);
                return;
            }
            if (err.code === err.PERMISSION_DENIED) {
                setState(prev => ({ ...prev, geoStatus: 'denied' }));
            }
        };

        // Fast fix
        navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTIONS);

        // Watch for updates
        watchIdRef.current = navigator.geolocation.watchPosition(
            onSuccess,
            onError,
            GEO_OPTIONS
        );
    }, []);

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    useEffect(() => {
        startWatching();
        return () => stopWatching();
    }, [startWatching, stopWatching]);

    return { ...state, startWatching, stopWatching };
}
