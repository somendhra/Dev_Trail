package com.example.aiinsurance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.Month;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * WeatherService — fetches real-time weather data from OpenWeatherMap API
 * for a given Indian district and returns a normalised WeatherData record.
 *
 * If the API key is missing or the call fails, a deterministic mock dataset
 * is returned so the rest of the pipeline never breaks.
 *
 * Configured via application.properties (or env vars):
 *   weather.owm.api-key=${OWM_API_KEY:}
 */
@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    // ── Config ──────────────────────────────────────────────────────────────────

    @Value("${weather.owm.api-key:}")
    private String owmApiKey;

    @Value("${weather.owm.base-url:https://api.openweathermap.org/data/2.5}")
    private String owmBaseUrl;

    @Value("${weather.owm.aqi-url:https://api.openweathermap.org/data/2.5/air_pollution}")
    private String owmAqiUrl;

    // ── Normalised output record ─────────────────────────────────────────────────

    /**
     * Canonical weather snapshot returned by every public method on this service.
     */
    public record WeatherData(
            String  district,
            String  state,
            String  condition,
            double  temperatureCelsius,
            double  rainfallMm,
            double  windSpeedKmh,
            int     aqi,
            double  humidity,
            double  feelsLikeCelsius,
            double  riskIndex,        // 0.0 – 1.0  composite disruption risk
            String  season,
            boolean isMockData,
            String  fetchedAt
    ) {
        /** Convenience: is any parametric threshold breached? */
        public boolean isDisrupted() {
            return temperatureCelsius >= 42
                || rainfallMm         >= 50
                || windSpeedKmh       >= 70
                || aqi                >= 300;
        }
    }

    // ── RestTemplate ─────────────────────────────────────────────────────────────

    private final RestTemplate rest = new RestTemplate();

    // ── Public API ───────────────────────────────────────────────────────────────

    /**
     * Fetch weather for a district. Falls back to mock data on any error.
     *
     * @param district  e.g. "Hyderabad"
     * @return WeatherData (never null)
     */
    public WeatherData getWeather(String district) {
        return getWeather(district, "");
    }

    /**
     * Fetch weather for a district within a state. State is used only for
     * mock-data generation when the API call fails.
     *
     * @param district  e.g. "Hyderabad"
     * @param state     e.g. "Telangana" (optional – used for mock seeding)
     * @return WeatherData (never null)
     */
    public WeatherData getWeather(String district, String state) {
        if (owmApiKey == null || owmApiKey.isBlank()) {
            log.debug("[WeatherService] OWM_API_KEY not configured – returning mock data for {}", district);
            return buildMock(district, state != null ? state : district);
        }
        try {
            return fetchFromOwm(district, state);
        } catch (Exception e) {
            log.warn("[WeatherService] OWM call failed for district='{}': {} – falling back to mock", district, e.getMessage());
            return buildMock(district, state != null ? state : district);
        }
    }

    /**
     * Convenience conversion to a plain Map (for JSON responses / AIService).
     */
    public Map<String, Object> getWeatherAsMap(String district, String state) {
        WeatherData w = getWeather(district, state);
        Map<String, Object> m = new HashMap<>();
        m.put("district",           w.district());
        m.put("state",              w.state());
        m.put("condition",          w.condition());
        m.put("temperature",        w.temperatureCelsius());
        m.put("temp",               w.temperatureCelsius());   // alias for Python engine
        m.put("rainfall",           w.rainfallMm());
        m.put("rainMm",             w.rainfallMm());
        m.put("windSpeedKmh",       w.windSpeedKmh());
        m.put("wind_speed",         w.windSpeedKmh());         // alias
        m.put("wind_kmh",           w.windSpeedKmh());         // alias
        m.put("aqi",                w.aqi());
        m.put("humidity",           w.humidity());
        m.put("feelsLike",          w.feelsLikeCelsius());
        m.put("riskIndex",          w.riskIndex());
        m.put("risk_index",         w.riskIndex());            // alias
        m.put("season",             w.season());
        m.put("isMockData",         w.isMockData());
        m.put("fetchedAt",          w.fetchedAt());
        m.put("isDisrupted",        w.isDisrupted());
        return m;
    }

    // ── OWM API calls ────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private WeatherData fetchFromOwm(String district, String state) throws Exception {
        // 1. Current weather
        String weatherUrl = UriComponentsBuilder
                .fromHttpUrl(owmBaseUrl + "/weather")
                .queryParam("q", district.trim() + ",IN")
                .queryParam("appid", owmApiKey)
                .queryParam("units", "metric")
                .build()
                .toUriString();

        Map<String, Object> raw = rest.getForObject(weatherUrl, Map.class);
        if (raw == null) throw new IllegalStateException("Null response from OWM weather API");

        // Parse main fields
        Map<String, Object> main  = (Map<String, Object>) raw.get("main");
        Map<String, Object> wind  = (Map<String, Object>) raw.get("wind");
        List<Map<String, Object>> weatherArr = (List<Map<String, Object>>) raw.get("weather");

        double temp      = toDouble(main.get("temp"),     28.0);
        double feelsLike = toDouble(main.get("feels_like"), temp);
        double humidity  = toDouble(main.get("humidity"),  60.0);
        double windMs    = toDouble(wind != null ? wind.get("speed") : null, 10.0);
        double windKmh   = Math.round(windMs * 3.6 * 10.0) / 10.0;
        String condition = weatherArr != null && !weatherArr.isEmpty()
                ? (String) weatherArr.get(0).get("description") : "Unknown";
        condition = capitalise(condition);

        // 2. Rain (last 1h if available)
        double rainfallMm = 0.0;
        Object rainRaw = raw.get("rain");
        if (rainRaw instanceof Map) {
            rainfallMm = toDouble(((Map<String, Object>) rainRaw).get("1h"), 0.0);
        }

        // 3. AQI — separate call with lat/lon
        int aqi = 80; // default safe
        try {
            Map<String, Object> coord = (Map<String, Object>) raw.get("coord");
            if (coord != null) {
                double lat = toDouble(coord.get("lat"), 20.0);
                double lon = toDouble(coord.get("lon"), 78.0);
                aqi = fetchAqi(lat, lon);
            }
        } catch (Exception e) {
            log.debug("[WeatherService] AQI fetch skipped: {}", e.getMessage());
        }

        double risk = computeRiskIndex(temp, rainfallMm, windKmh, aqi, humidity);

        return new WeatherData(
                district, state.isBlank() ? district : state,
                condition, temp, rainfallMm, windKmh, aqi, humidity, feelsLike,
                risk, currentSeason(), false,
                java.time.LocalDateTime.now().toString()
        );
    }

    @SuppressWarnings("unchecked")
    private int fetchAqi(double lat, double lon) {
        String url = UriComponentsBuilder
                .fromHttpUrl(owmAqiUrl)
                .queryParam("lat",   lat)
                .queryParam("lon",   lon)
                .queryParam("appid", owmApiKey)
                .build()
                .toUriString();

        Map<String, Object> raw = rest.getForObject(url, Map.class);
        if (raw == null) return 80;

        List<Map<String, Object>> list = (List<Map<String, Object>>) raw.get("list");
        if (list == null || list.isEmpty()) return 80;

        Map<String, Object> first = list.get(0);
        Map<String, Object> main  = (Map<String, Object>) first.get("main");
        if (main == null) return 80;

        // OWM AQI is 1–5; convert to India AQI-like scale (0–500)
        int owmAqi  = toInt(main.get("aqi"), 2);
        int[] bands = {50, 100, 200, 300, 400};
        return owmAqi >= 1 && owmAqi <= 5 ? bands[owmAqi - 1] : 100;
    }

    // ── Mock / fallback data ─────────────────────────────────────────────────────

    /** District → approximate bounding-box center for deterministic seeding */
    private static final Map<String, double[]> DISTRICT_COORDS = Map.ofEntries(
        Map.entry("Hyderabad",      new double[]{ 17.39,  78.49 }),
        Map.entry("Mumbai",         new double[]{ 19.08,  72.88 }),
        Map.entry("Delhi",          new double[]{ 28.61,  77.23 }),
        Map.entry("Bengaluru",      new double[]{ 12.97,  77.59 }),
        Map.entry("Chennai",        new double[]{ 13.08,  80.27 }),
        Map.entry("Pune",           new double[]{ 18.52,  73.86 }),
        Map.entry("Kolkata",        new double[]{ 22.57,  88.36 }),
        Map.entry("Ahmedabad",      new double[]{ 23.03,  72.58 }),
        Map.entry("Jaipur",         new double[]{ 26.91,  75.79 }),
        Map.entry("Lucknow",        new double[]{ 26.85,  80.95 }),
        Map.entry("Visakhapatnam", new double[]{ 17.69,  83.22 }),
        Map.entry("Warangal",       new double[]{ 18.00,  79.59 }),
        Map.entry("Nizamabad",      new double[]{ 18.67,  78.09 }),
        Map.entry("Surat",          new double[]{ 21.20,  72.84 }),
        Map.entry("Indore",         new double[]{ 22.72,  75.86 })
    );

    /** Deterministic mock weather seeded on district + today's date. */
    private WeatherData buildMock(String district, String state) {
        String seed = district + ":" + state + ":" + LocalDate.now();
        long hash   = seed.chars().mapToLong(c -> c).reduce(0L, (a, c) -> 31L * a + c);
        Random rng  = new Random(Math.abs(hash));

        String season = currentSeason();

        // Temperature ranges per season
        double tempMin, tempMax;
        switch (season) {
            case "summer"      -> { tempMin = 34; tempMax = 46; }
            case "monsoon"     -> { tempMin = 24; tempMax = 35; }
            case "winter"      -> { tempMin = 10; tempMax = 22; }
            default            -> { tempMin = 22; tempMax = 32; }  // post-monsoon
        }
        double temp     = round1(tempMin + rng.nextDouble() * (tempMax - tempMin));
        double feels    = round1(temp - rng.nextDouble() * 3);
        double humidity = round1(30 + rng.nextDouble() * 65);

        // Rainfall: higher during monsoon
        double rainfall = 0;
        if ("monsoon".equals(season)) {
            rainfall = rng.nextDouble() < 0.55
                    ? round1(rng.nextDouble() * 200)
                    : 0;
        } else if ("winter".equals(season)) {
            rainfall = rng.nextDouble() < 0.10
                    ? round1(rng.nextDouble() * 15)
                    : 0;
        } else {
            rainfall = rng.nextDouble() < 0.20
                    ? round1(rng.nextDouble() * 60)
                    : 0;
        }

        double windKmh = round1(5 + rng.nextDouble() * 75);
        int    aqi     = 50 + rng.nextInt(350);

        String condition = deriveCondition(temp, rainfall, windKmh, aqi, season);
        double risk      = computeRiskIndex(temp, rainfall, windKmh, aqi, humidity);

        return new WeatherData(
                district, state, condition,
                temp, rainfall, windKmh, aqi, humidity, feels,
                risk, season, true,
                java.time.LocalDateTime.now().toString()
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    /** Compute a 0–1 composite disruption risk index. */
    private double computeRiskIndex(double temp, double rainfall, double windKmh,
                                    int aqi, double humidity) {
        double tScore = temp >= 45 ? 1.0 : temp >= 40 ? 0.75 : temp >= 35 ? 0.50 : 0.20;
        double rScore = rainfall >= 100 ? 1.0 : rainfall >= 50 ? 0.80 : rainfall >= 20 ? 0.45 : 0.0;
        double wScore = windKmh >= 80 ? 1.0 : windKmh >= 60 ? 0.70 : windKmh >= 40 ? 0.40 : 0.10;
        double aScore = aqi >= 400 ? 1.0 : aqi >= 300 ? 0.80 : aqi >= 200 ? 0.50 : 0.15;
        double hScore = humidity >= 90 ? 0.60 : humidity >= 80 ? 0.40 : 0.10;

        double raw = tScore * 0.25 + rScore * 0.35 + wScore * 0.20 + aScore * 0.15 + hScore * 0.05;
        return round3(Math.min(1.0, raw));
    }

    /** Choose a readable condition label from raw metrics. */
    private String deriveCondition(double temp, double rainfall, double windKmh,
                                   int aqi, String season) {
        if (rainfall >= 100) return "Heavy Rain";
        if (rainfall >= 40)  return "Moderate Rain";
        if (rainfall >= 10)  return "Light Rain";
        if (windKmh >= 80)   return "Cyclone Warning";
        if (windKmh >= 60)   return "High Winds";
        if (temp >= 45)      return "Severe Heat Wave";
        if (temp >= 42)      return "Heat Wave";
        if (aqi >= 300)      return "Hazardous Air Quality";
        if (aqi >= 200)      return "Very Poor Air Quality";
        if ("summer".equals(season) && temp >= 38) return "Partly Cloudy · Hot";
        if ("monsoon".equals(season)) return "Overcast · Humid";
        return "Clear";
    }

    private String currentSeason() {
        int m = LocalDate.now().getMonthValue();
        if (m >= 6 && m <= 9)  return "monsoon";
        if (m >= 11 || m <= 2) return "winter";
        if (m >= 3 && m <= 5)  return "summer";
        return "post_monsoon";
    }

    private String capitalise(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private double toDouble(Object v, double def) {
        if (v == null) return def;
        try { return ((Number) v).doubleValue(); } catch (Exception e) { return def; }
    }

    private int toInt(Object v, int def) {
        if (v == null) return def;
        try { return ((Number) v).intValue(); } catch (Exception e) { return def; }
    }

    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
    private double round3(double v) { return Math.round(v * 1000.0) / 1000.0; }
}
