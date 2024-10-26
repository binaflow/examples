package com.github.binaflow.citiespickerjavaspring;

import com.github.binaflow.citiespickerjavaspring.dto.City;
import com.github.binaflow.citiespickerjavaspring.dto.GetCitiesRequest;
import com.github.binaflow.citiespickerjavaspring.dto.GetCitiesResponse;
import dev.toliyansky.binaflow.annotation.Controller;
import dev.toliyansky.binaflow.annotation.MessageMapping;

import java.util.List;

@Controller
public class CitiesController {

    @MessageMapping
    public GetCitiesResponse getCities(GetCitiesRequest request) {
        return GetCitiesResponse.newBuilder()
                .setMessageId(request.getMessageId())
                .addAllCities(List.of(
                        City.newBuilder()
                                .setName("Moscow")
                                .setLatitude(55.7558)
                                .setLongitude(37.6176)
                                .build(),
                        City.newBuilder()
                                .setName("Saint Petersburg")
                                .setLatitude(59.9343)
                                .setLongitude(30.3351)
                                .build()
                ))
                .build();
    }
}
