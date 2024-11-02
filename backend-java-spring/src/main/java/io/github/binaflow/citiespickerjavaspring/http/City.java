package io.github.binaflow.citiespickerjavaspring.http;

import com.fasterxml.jackson.annotation.JsonProperty;

public class City {
    @JsonProperty
    String name;
    @JsonProperty
    double latitude;
    @JsonProperty
    double longitude;
    @JsonProperty
    int population;
}
