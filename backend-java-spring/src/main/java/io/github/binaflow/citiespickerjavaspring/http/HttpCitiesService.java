package io.github.binaflow.citiespickerjavaspring.http;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

import static java.lang.Math.*;

@Service
public class HttpCitiesService {

    private static final Set<City> cities = new HashSet<>(6163);

    @Value("${world-cities-file-path}")
    public String worldCitiesFilePath;

    @PostConstruct
    public void init() throws IOException {
        Files.readAllLines(Path.of(worldCitiesFilePath)).stream()
                .skip(1)
                .map(line -> line.split(";"))
                .map(parts -> {
                    var city = new City();
                    city.name = parts[0];
                    city.latitude = Double.parseDouble(parts[1]);
                    city.longitude = Double.parseDouble(parts[2]);
                    city.population = Integer.parseInt(parts[3]);
                    return city;
                })
                .forEach(cities::add);
    }

    public GetCitiesResponse getCities(double latitude, double longitude, double maxDistance, int minPopulation) {
        var filteredCities = cities.stream()
                .filter(city -> city.population >= minPopulation)
                .filter(city -> {
                    double distance = calculateDistance(
                            latitude,
                            longitude,
                            city.latitude,
                            city.longitude
                    );
                    return distance <= maxDistance;
                })
                .toList();
        var getCitiesResponse = new GetCitiesResponse();
        getCitiesResponse.cities = filteredCities;
        return getCitiesResponse;
    }

    // Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371;
        double dLat = toRadians(lat2 - lat1);
        double dLon = toRadians(lon2 - lon1);

        double a = sin(dLat / 2) * sin(dLat / 2) +
                   cos(toRadians(lat1)) * cos(toRadians(lat2)) *
                   sin(dLon / 2) * sin(dLon / 2);
        double c = 2 * atan2(sqrt(a), sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}