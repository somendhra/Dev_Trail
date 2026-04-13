package com.example.aiinsurance.service;

import com.example.aiinsurance.model.Trigger;
import com.example.aiinsurance.repository.TriggerRepository;
import com.example.aiinsurance.service.WeatherService.WeatherData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.DependsOn;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TriggerService — the core parametric evaluation engine.
 *
 * Responsibilities:
 *  1. Seeds default GigShield trigger rules on first startup (if table empty).
 *  2. checkTriggers(district, state) → fetches live/mock weather via WeatherService
 *     and evaluates every active Trigger row against the returned metrics.
 *  3. Returns a list of BreachResult objects for every breached rule.
 *
 *  AutoClaimService calls this once per active subscription per hourly cycle.
 */
@Service
public class TriggerService {

    private static final Logger log = LoggerFactory.getLogger(TriggerService.class);

    @Autowired private TriggerRepository triggerRepository;
    @Autowired private WeatherService    weatherService;

    // ── Public record returned per breach ─────────────────────────────────────────

    public record BreachResult(
            Trigger     trigger,
            double      actualValue,
            String      situation,
            String      description
    ) {}

    // ── Seed defaults ─────────────────────────────────────────────────────────────

    /**
     * Called by AdminInitializer after startup — seeds built-in trigger rules
     * if the triggers table is empty.
     */
    public void seedDefaultTriggers() {
        if (triggerRepository.count() > 0) {
            log.info("[TriggerService] Trigger table already seeded ({} rows) — skipping.", triggerRepository.count());
            return;
        }

        List<Trigger> defaults = List.of(
            // ── Rain ──────────────────────────────────────────────────────────────
            new Trigger("HEAVY_RAIN",       "rainfall",    50,  ">=", "mm",   "INCOME_LOSS",  6),
            new Trigger("EXTREME_RAIN",     "rainfall",    100, ">=", "mm",   "INCOME_LOSS",  6),
            new Trigger("CYCLONE",          "rainfall",    200, ">=", "mm",   "INCOME_LOSS",  12),
            // ── Heat ──────────────────────────────────────────────────────────────
            new Trigger("EXTREME_HEAT",     "temperature", 42,  ">=", "°C",   "INCOME_LOSS",  6),
            new Trigger("SEVERE_HEAT_WAVE", "temperature", 45,  ">=", "°C",   "INCOME_LOSS",  6),
            // ── Wind ──────────────────────────────────────────────────────────────
            new Trigger("HIGH_WINDS",       "wind_speed",  60,  ">=", "km/h", "INCOME_LOSS",  6),
            new Trigger("CYCLONE_WINDS",    "wind_speed",  80,  ">=", "km/h", "INCOME_LOSS",  12),
            // ── Air Quality ───────────────────────────────────────────────────────
            new Trigger("HAZARDOUS_AQI",    "aqi",         300, ">=", "AQI",  "INCOME_LOSS",  6),
            new Trigger("POOR_AQI",         "aqi",         200, ">=", "AQI",  "INCOME_LOSS",  4),
            // ── Humidity/Cold ──────────────────────────────────────────────────────
            new Trigger("EXTREME_HUMIDITY", "humidity",    92,  ">=", "%",    "INCOME_LOSS",  4)
        );

        triggerRepository.saveAll(defaults);
        log.info("[TriggerService] Seeded {} default trigger rules.", defaults.size());
    }

    // ── Core evaluation ───────────────────────────────────────────────────────────

    /**
     * Evaluates all active trigger rules against current weather for the given district.
     *
     * @param district  Worker's registered district (e.g. "Hyderabad")
     * @param state     Worker's registered state   (e.g. "Telangana")
     * @return          List of BreachResult — one per breached rule (empty if no breach)
     */
    public List<BreachResult> checkTriggers(String district, String state) {
        List<BreachResult> breaches = new ArrayList<>();

        // 1. Fetch live / mock weather
        WeatherData weather = weatherService.getWeather(
                district != null && !district.isBlank() ? district : state,
                state    != null ? state : district
        );

        log.info("[TriggerService] Weather for {}/{} → temp={}°C rain={}mm wind={}km/h aqi={} mock={}",
                district, state,
                weather.temperatureCelsius(), weather.rainfallMm(),
                weather.windSpeedKmh(), weather.aqi(), weather.isMockData());

        // Build a lookup map of metric → actual value
        Map<String, Double> metrics = buildMetrics(weather);

        // 2. Evaluate every active trigger
        List<Trigger> activeTriggers = triggerRepository.findByIsActiveTrue();
        for (Trigger t : activeTriggers) {
            Double actual = resolveMetric(metrics, t.getFactor());
            if (actual == null) continue;

            if (evaluate(actual, t.getOperator(), t.getThreshold())) {
                String desc = String.format(
                        "%s threshold breached: %s is %.1f%s (trigger: %s %.1f%s) in %s",
                        t.getSituation(), t.getFactor(), actual, t.getUnit(),
                        t.getOperator(), t.getThreshold(), t.getUnit(), district);
                breaches.add(new BreachResult(t, actual, t.getSituation(), desc));
                log.info("[TriggerService] ⚠️ BREACH: {}", desc);
            }
        }

        log.info("[TriggerService] {} breach(es) detected for {}", breaches.size(), district);
        return breaches;
    }

    /**
     * Checks triggers and returns the highest-severity breach, or null if none.
     * Convenience wrapper used by AutoClaimService when only one breach event
     * should produce one ClaimRequest.
     */
    public BreachResult checkPrimaryTrigger(String district, String state) {
        List<BreachResult> all = checkTriggers(district, state);
        if (all.isEmpty()) return null;
        // Prefer the most extreme breach (highest actual/threshold ratio)
        return all.stream()
                .max((a, b) -> Double.compare(
                        a.actualValue() / Math.max(1, a.trigger().getThreshold()),
                        b.actualValue() / Math.max(1, b.trigger().getThreshold())))
                .orElse(all.get(0));
    }

    /**
     * Returns current weather snapshot for a district (used by WeatherController
     * and admin dashboard).
     */
    public Map<String, Object> getWeatherSnapshot(String district, String state) {
        return weatherService.getWeatherAsMap(district, state);
    }

    // ── CRUD wrappers for AdminController ────────────────────────────────────────

    public List<Trigger> getAllTriggers()       { return triggerRepository.findAll(); }
    public List<Trigger> getActiveTriggers()    { return triggerRepository.findByIsActiveTrue(); }

    public Trigger save(Trigger t)             { return triggerRepository.save(t); }

    public Trigger toggle(Long id, boolean active) {
        Trigger t = triggerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trigger not found: " + id));
        t.setActive(active);
        return triggerRepository.save(t);
    }

    public void delete(Long id) { triggerRepository.deleteById(id); }

    // ── Internal helpers ──────────────────────────────────────────────────────────

    private Map<String, Double> buildMetrics(WeatherData w) {
        Map<String, Double> m = new HashMap<>();
        m.put("temperature", w.temperatureCelsius());
        m.put("temp",        w.temperatureCelsius());
        m.put("rainfall",    w.rainfallMm());
        m.put("rain",        w.rainfallMm());
        m.put("wind_speed",  w.windSpeedKmh());
        m.put("wind",        w.windSpeedKmh());
        m.put("windspeed",   w.windSpeedKmh());
        m.put("aqi",         (double) w.aqi());
        m.put("humidity",    w.humidity());
        m.put("risk_index",  w.riskIndex());
        return m;
    }

    private Double resolveMetric(Map<String, Double> metrics, String factor) {
        if (factor == null) return null;
        return metrics.getOrDefault(factor.toLowerCase().replace(" ", "_"),
               metrics.get(factor.toLowerCase()));
    }

    private boolean evaluate(double actual, String op, double threshold) {
        return switch (op) {
            case ">"  -> actual >  threshold;
            case ">=" -> actual >= threshold;
            case "<"  -> actual <  threshold;
            case "<=" -> actual <= threshold;
            case "==" -> actual == threshold;
            default   -> false;
        };
    }
}
