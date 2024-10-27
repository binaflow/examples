package com.github.binaflow.citiespickerjavaspring;

import com.github.binaflow.citiespickerjavaspring.dto.GetCitiesRequest;
import com.github.binaflow.citiespickerjavaspring.dto.GetCitiesResponse;
import dev.toliyansky.binaflow.annotation.Controller;
import dev.toliyansky.binaflow.annotation.MessageMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CitiesController {

    private final CitiesService citiesService;

    @MessageMapping
    public GetCitiesResponse getCities(GetCitiesRequest request) {
        log.info("Received request: {}", request);
        return citiesService.getCities(request);
    }
}
