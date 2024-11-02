package io.github.binaflow.citiespickerjavaspring;

import io.github.binaflow.citiespickerjavaspring.dto.City;
import io.github.binaflow.citiespickerjavaspring.dto.GetCitiesRequest;
import io.github.binaflow.citiespickerjavaspring.dto.GetCitiesResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

import static java.lang.Math.*;
import static java.lang.Math.sqrt;

@Service
public class CitiesService {

    private static final Set<City> cities = new HashSet<>(6163);

    @Value("${world-cities-file-path}")
    public String worldCitiesFilePath;

    @PostConstruct
    public void init() throws IOException {
        Files.readAllLines(Path.of(worldCitiesFilePath)).stream()
                .skip(1)
                .map(line -> line.split(";"))
                .map(parts -> City.newBuilder()
                        .setName(parts[0])
                        .setLatitude(Double.parseDouble(parts[1]))
                        .setLongitude(Double.parseDouble(parts[2]))
                        .setPopulation(Integer.parseInt(parts[3]))
                        .build())
                .forEach(cities::add);
    }

    public GetCitiesResponse getCities(GetCitiesRequest request) {
        var filteredCities = cities.stream()
                .filter(city -> city.getPopulation() >= request.getMinPopulation())
                .filter(city -> {
                    double distance = calculateDistance(
                            request.getLatitude(),
                            request.getLongitude(),
                            city.getLatitude(),
                            city.getLongitude()
                    );
                    return distance <= request.getMaxDistance();
                })
                .toList();
        return GetCitiesResponse.newBuilder()
                .addAllCities(filteredCities)
                .build();
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