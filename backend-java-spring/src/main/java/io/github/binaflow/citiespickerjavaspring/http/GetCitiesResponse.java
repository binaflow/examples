package io.github.binaflow.citiespickerjavaspring.http;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class GetCitiesResponse {
    @JsonProperty
    List<City> cities;
}
