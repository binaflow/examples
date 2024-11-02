package io.github.binaflow.citiespickerjavaspring;

import io.github.binaflow.annotation.Controller;
import io.github.binaflow.annotation.MessageMapping;
import io.github.binaflow.citiespickerjavaspring.dto.GetCitiesRequest;
import io.github.binaflow.citiespickerjavaspring.dto.GetCitiesResponse;

@Controller
public class CitiesController {

    public CitiesController(CitiesService citiesService) {
        this.citiesService = citiesService;
    }

    private final CitiesService citiesService;

    @MessageMapping
    public GetCitiesResponse getCities(GetCitiesRequest request) {
        return citiesService.getCities(request);
    }
}
