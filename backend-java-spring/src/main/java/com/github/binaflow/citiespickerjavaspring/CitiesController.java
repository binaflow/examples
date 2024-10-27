package com.github.binaflow.citiespickerjavaspring;

import com.github.binaflow.annotation.Controller;
import com.github.binaflow.annotation.MessageMapping;
import com.github.binaflow.citiespickerjavaspring.dto.GetCitiesRequest;
import com.github.binaflow.citiespickerjavaspring.dto.GetCitiesResponse;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class CitiesController {

    private final CitiesService citiesService;

    @MessageMapping
    public GetCitiesResponse getCities(GetCitiesRequest request) {
        return citiesService.getCities(request);
    }
}
