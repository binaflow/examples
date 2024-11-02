package io.github.binaflow.citiespickerjavaspring.http;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CitiesHttpController {

    public CitiesHttpController(HttpCitiesService httpCitiesService) {
        this.httpCitiesService = httpCitiesService;
    }

    private final HttpCitiesService httpCitiesService;

    @GetMapping("/cities")
    public GetCitiesResponse getCities(@RequestParam double latitude,
                                       @RequestParam double longitude,
                                       @RequestParam double maxDistance,
                                       @RequestParam int minPopulation) {
        return httpCitiesService.getCities(latitude, longitude, maxDistance, minPopulation);
    }
}
